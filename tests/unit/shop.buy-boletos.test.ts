import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from '../e2e/setup';

let mongod: any;
let app: any;

describe('Shop - buy boletos', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('should charge val and add boletos according to GameSetting costo_ticket_en_val', async () => {
    // register user
    const user = { email: `sb${Date.now()}@test.com`, username: `sb${Date.now()}`, password: 'Test1234!A' };
    await request(app).post('/auth/register').send(user).expect(201);
    const { User } = await import('../../src/models/User');
    const u = await User.findOne({ email: user.email });
    await request(app).get(`/auth/verify/${(u as any).verificationToken}`).expect(200);
    const loginRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
    const token = loginRes.body.token;

    // Ensure user has adequate VAL and reset boletos to 0 for purchase
    await User.findByIdAndUpdate((u as any)._id, { $set: { val: 10000, boletos: 0 } });

    // Fetch GameSetting directly to get costPerBoleto (avoids depending on endpoint formatting)
    const GameSetting = (await import('../../src/models/GameSetting')).default;
    const gs = await GameSetting.findOne();
    const costPerBoleto = gs?.costo_ticket_en_val || 100;
    const amount = 2;
    const totalCost = amount * costPerBoleto;

    // Buy boletos
    const res = await request(app)
      .post('/api/shop/buy-boletos')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount })
      .expect(200);

    expect(res.body.resources).toBeDefined();
    expect(res.body.resources.boletos).toBe(amount);

    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(me.body.val).toBe(10000 - totalCost);
    expect(me.body.boletos).toBe(amount);
  });
});
