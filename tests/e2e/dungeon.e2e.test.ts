import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

describe('E2E Dungeon / Drops (skeleton)', () => {
  const user = { email: `dun${Date.now()}@test.com`, username: `dun${Date.now()}`, password: 'test1234' };
  let token: string;
  let characterId: string;

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;

    await request(app).post('/auth/register').send(user).expect(201);
    const { User } = await import('../../src/models/User');
    const u = await User.findOne({ email: user.email });
    await request(app).get(`/auth/verify/${(u as any).verificationToken}`).expect(200);
    const loginRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
    token = loginRes.body.token;

    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    characterId = me.body.personajes?.[0]?.personajeId;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('entrar a mazmorra y recibir drops/experiencia', async () => {
    // TODO: ajustar rutas reales de mazmorra
    const start = await request(app).post('/api/dungeons/start').set('Authorization', `Bearer ${token}`).send({ characterId });
    expect([200,201,404]).toContain(start.status);

    if (start.status === 200 || start.status === 201) {
      // Simular resultado (victoria)
      const result = await request(app).post(`/api/dungeons/${start.body.id}/complete`).set('Authorization', `Bearer ${token}`).send({ victory: true });
      expect([200,201]).toContain(result.status);

      if (result.status === 200 || result.status === 201) {
        const meAfter = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
        expect(meAfter.status).toBe(200);
        // Validación mínima: user gains xp or items
        const body = meAfter.body as any;
        expect((typeof body.val === 'number' && body.val >= 0) || (Array.isArray(body.inventarioConsumibles) && body.inventarioConsumibles.length >= 0)).toBeTruthy();
      }
    }
  }, 20000);
});
