import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from '../e2e/setup';

let mongod: any;
let app: any;

jest.setTimeout(20_000);

describe('Items - buy', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('POST /api/items/:id/buy should allow buying a consumable with VAL', async () => {
    // register + verify + login
    const email = `buyitem${Date.now()}@test.com`;
    await request(app).post('/auth/register').send({ email, username: email, password: 'StrongPass1!' }).expect(201);
    const { User } = await import('../../src/models/User');
    const user = await User.findOne({ email });
    await request(app).get(`/auth/verify/${(user as any).verificationToken}`).expect(200);
    const login = await request(app).post('/auth/login').send({ email, password: 'StrongPass1!' }).expect(200);
    const token = login.body.token;

    // Fund user
    (user as any).val = 100;
    await user!.save();

    // Consumable seeded in seedTestData with id 68dc525adb5c735854b5659d
    const consumableId = '68dc525adb5c735854b5659d';

    const res = await request(app)
      .post(`/api/items/${consumableId}/buy`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidad: 1, currency: 'val' })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.purchased).toBeDefined();
    const refreshed = await User.findById((user as any)._id);
    expect(refreshed?.val).toBe(90); // costo 10
    expect(refreshed?.inventarioConsumibles.length).toBeGreaterThanOrEqual(1);
    const instance = refreshed?.inventarioConsumibles.find((c: any) => String(c.consumableId) === consumableId);
    expect(instance).toBeDefined();
    expect(instance?.usos_restantes).toBe(1);
  });
});