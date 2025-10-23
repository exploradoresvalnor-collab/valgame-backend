import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

describe('E2E - Nuevo usuario flujo completo (MVP)', () => {
  const user = { email: `new${Date.now()}@test.com`, username: `new${Date.now()}`, password: 'test1234' };
  let token: string;
  let itemId: string;
  let listingId: string;

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('registro, verificacion y login', async () => {
    const reg = await request(app).post('/auth/register').send(user).expect(201);
    // obtener token de verificacion desde DB
    const { User } = await import('../../src/models/User');
    const u = await User.findOne({ email: user.email });
    expect(u).toBeDefined();
    const verify = await request(app).get(`/auth/verify/${(u as any).verificationToken}`).expect(200);
    const login = await request(app).post('/auth/login').send({ email: user.email, password: user.password }).expect(200);
    token = login.body.token;
    expect(token).toBeDefined();
  });

  it('recibe paquete de bienvenida y abre paquete', async () => {
    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(me.body.inventarioConsumibles.length).toBeGreaterThan(0);
    itemId = me.body.inventarioConsumibles[0].consumableId;

    // Obtener un characterId donde aplicar el consumible (fallback si no hay personajes)
    const characterId = (me.body.personajes && me.body.personajes.length)
      ? me.body.personajes[0].personajeId
      : (me.body.personajeActivoId || 'base_d_001');

    // Llamar al endpoint correcto para usar consumible
    const useRes = await request(app)
      .post(`/api/characters/${characterId}/use-consumable`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId })
      .expect(200);
    expect(useRes.body.message).toBeDefined();
  });

  it('publicar listing y verificar búsqueda en marketplace', async () => {
    // publicar item
    const pub = await request(app)
      .post('/api/marketplace/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId, precio: 5 })
      .expect(201);
    listingId = pub.body.listing.id || pub.body.listing._id;

    // buscar en marketplace
    const search = await request(app)
      .get('/api/marketplace/listings')
      .set('Authorization', `Bearer ${token}`)
      .query({ type: 'consumible' })
      .expect(200);
    const found = (search.body.listings || []).some((l: any) => l._id === listingId || l.id === listingId || l.itemId === itemId);
    expect(found).toBe(true);
  }, 30000);
});
