import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from '../e2e/setup';

let mongod: any;
let app: any;

describe('Items - purchase audit', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('creates a PurchaseTransaction record on successful buy', async () => {
    const email = `audit${Date.now()}@test.com`;
    await request(app).post('/auth/register').send({ email, username: email, password: 'StrongPass1!' }).expect(201);
    const { User } = await import('../../src/models/User');
    const user = await User.findOne({ email });
    await request(app).get(`/auth/verify/${(user as any).verificationToken}`).expect(200);
    const login = await request(app).post('/auth/login').send({ email, password: 'StrongPass1!' }).expect(200);
    const token = login.body.token;

    // Consumable seeded in seedTestData with id 68dc525adb5c735854b5659d and costo_val 10
    const consumableId = '68dc525adb5c735854b5659d';

    (user as any).val = 100;
    await user!.save();

    const res = await request(app)
      .post(`/api/items/${consumableId}/buy`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidad: 1, currency: 'val' })
      .expect(200);

    expect(res.body.ok).toBe(true);

    const { default: PurchaseTransaction } = await import('../../src/models/PurchaseTransaction');
    const tx = await PurchaseTransaction.findOne({ userId: (user as any)._id, itemId: consumableId });
    expect(tx).toBeDefined();
    expect(tx?.totalCostoVal).toBeGreaterThanOrEqual(0);
  });

  it('does not create audit record if transaction rolls back', async () => {
    const email = `auditfail${Date.now()}@test.com`;
    await request(app).post('/auth/register').send({ email, username: email, password: 'StrongPass1!' }).expect(201);
    const { User } = await import('../../src/models/User');
    const user = await User.findOne({ email });
    await request(app).get(`/auth/verify/${(user as any).verificationToken}`).expect(200);
    const login = await request(app).post('/auth/login').send({ email, password: 'StrongPass1!' }).expect(200);
    const token = login.body.token;

    // Crear un equipment para probar rollback
    const { Equipment } = await import('../../src/models/Equipment');
    const equipment = await Equipment.create({
      _id: new (await import('mongoose')).Types.ObjectId(),
      nombre: 'Rollback Sword',
      descripcion: 'Para testing rollback',
      rango: 'D',
      tipo: 'arma',
      nivel_minimo_requerido: 1,
      stats: { atk: 5, defensa: 1, vida: 0 },
      costo_val: 25
    } as any);

    (user as any).val = 100;
    await user!.save();

    // Mock save to throw when invoked inside the transaction
    const { User: UserModel } = await import('../../src/models/User');
    const saveSpy = jest.spyOn(UserModel.prototype, 'save').mockImplementation(function () {
      throw new Error('Simulated save failure');
    });

    const res = await request(app)
      .post(`/api/items/${equipment._id}/buy`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidad: 1, currency: 'val' });

    // Restore mock
    saveSpy.mockRestore();

    expect(res.status).toBeGreaterThanOrEqual(500);

    const { default: PurchaseTransaction } = await import('../../src/models/PurchaseTransaction');
    const tx = await PurchaseTransaction.findOne({ userId: (user as any)._id, itemId: (equipment as any)._id });
    expect(tx).toBeNull();
  });
});