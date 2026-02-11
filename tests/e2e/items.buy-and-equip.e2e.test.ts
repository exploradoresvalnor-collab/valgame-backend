import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';
import { Types } from 'mongoose';

let mongod: any;
let app: any;

jest.setTimeout(30_000);

describe('E2E Items buy + equip', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('should buy an equipment and equip it to a character', async () => {
    // register + verify + login
    const email = `buyandequip${Date.now()}@test.com`;
    await request(app).post('/auth/register').send({ email, username: email, password: 'StrongPass1!' }).expect(201);
    const { User } = await import('../../src/models/User');
    const user = await User.findOne({ email });
    await request(app).get(`/auth/verify/${(user as any).verificationToken}`).expect(200);
    const login = await request(app).post('/auth/login').send({ email, password: 'StrongPass1!' }).expect(200);
    const token = login.body.token;

    // Create equipment for sale
    const { Equipment } = await import('../../src/models/Equipment');
    const equipment = await Equipment.create({
      _id: new Types.ObjectId(),
      nombre: 'Espada de Test',
      descripcion: 'Para testing',
      rango: 'D',
      tipo: 'arma',
      nivel_minimo_requerido: 1,
      stats: { atk: 5, defensa: 1, vida: 0 },
      costo_val: 25,
      fuentes_obtencion: ['tienda']
    } as any);

    // Fund user
    (user as any).val = 100;

    // Add a character to the user to equip
    (user as any).personajes.push({
      personajeId: 'test_char_1',
      rango: 'D',
      nivel: 1,
      etapa: 1,
      progreso: 0,
      experiencia: 0,
      stats: { atk: 10, vida: 50, defensa: 5 },
      saludActual: 50,
      saludMaxima: 50,
      estado: 'saludable',
      fechaHerido: null,
      equipamiento: [],
      activeBuffs: []
    } as any);

    await user!.save();

    // Buy equipment
    const res = await request(app)
      .post(`/api/items/${equipment._id}/buy`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidad: 1, currency: 'val' })
      .expect(200);

    expect(res.body.ok).toBe(true);

    const refreshed = await User.findById((user as any)._id);
    expect(refreshed?.val).toBe(75); // 100 - 25
    expect(refreshed?.inventarioEquipamiento.some((id: any) => String(id) === String(equipment._id))).toBe(true);

    // Equip the item
    const equipRes = await request(app)
      .post(`/api/characters/test_char_1/equip`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: equipment._id })
      .expect(200);

    expect(equipRes.body.message).toMatch(/ha sido equipado/);
    expect(equipRes.body.character.equipamiento.some((id: any) => String(id) === String(equipment._id))).toBe(true);
  });
});