import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';
import { User } from '../../src/models/User';

let mongod: any;
let app: any;

describe('E2E Consumibles', () => {
  const testUser = { email: `cons${Date.now()}@test.com`, username: `cons${Date.now()}`, password: 'test1234' };
  let authToken: string;
  let characterId: string;
  let itemId: string;

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;

    await request(app).post('/auth/register').send(testUser).expect(201);
    const { User: UserModel } = await import('../../src/models/User');
    const user = await UserModel.findOne({ email: testUser.email });
    const token = (user as any).verificationToken;
    await request(app).get(`/auth/verify/${token}`).expect(200);
    const loginRes = await request(app).post('/auth/login').send({ email: testUser.email, password: testUser.password });
    authToken = loginRes.body.token;

    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${authToken}`);
    characterId = me.body.personajes[0].personajeId;
    itemId = me.body.inventarioConsumibles[0].consumableId;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('usar consumible y validar efectos', async () => {
    // dañar personaje
    const { User: UserModel } = await import('../../src/models/User');
    const userPre = await UserModel.findOne({ email: testUser.email });
    const char = userPre!.personajes.find((p: any) => p.personajeId === characterId)!;
    char.saludActual = 30;
    await userPre!.save();

    const res = await request(app)
      .post(`/api/characters/${characterId}/use-consumable`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ itemId });

    expect(res.status).toBe(200);

    const userPost = await UserModel.findOne({ email: testUser.email });
    const charPost = userPost!.personajes.find((p: any) => p.personajeId === characterId)!;
    expect(charPost.saludActual).toBeGreaterThan(30);

    // El seed añade 3 instancias del mismo consumible; tras usar uno, el conteo debe decrecer en 1
    const beforeCount = (await UserModel.findOne({ email: testUser.email }))!.inventarioConsumibles.filter((c: any) => c.consumableId.toString() === itemId).length + 1; // +1 because ya consumimos
    const afterCount = userPost!.inventarioConsumibles.filter((c: any) => c.consumableId.toString() === itemId).length;
    expect(afterCount).toBe(beforeCount - 1);
  }, 20000);
});
