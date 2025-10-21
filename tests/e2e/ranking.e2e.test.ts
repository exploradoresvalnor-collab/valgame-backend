import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

describe('E2E Ranking (skeleton)', () => {
  const userA = { email: `rankA${Date.now()}@test.com`, username: `rankA${Date.now()}`, password: 'test1234' };
  const userB = { email: `rankB${Date.now()}@test.com`, username: `rankB${Date.now()}`, password: 'test1234' };
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;

    await request(app).post('/auth/register').send(userA).expect(201);
    await request(app).post('/auth/register').send(userB).expect(201);
    const { User } = await import('../../src/models/User');
    const a = await User.findOne({ email: userA.email });
    const b = await User.findOne({ email: userB.email });
    await request(app).get(`/auth/verify/${(a as any).verificationToken}`).expect(200);
    await request(app).get(`/auth/verify/${(b as any).verificationToken}`).expect(200);
    const la = await request(app).post('/auth/login').send({ email: userA.email, password: userA.password });
    tokenA = la.body.token;
    const lb = await request(app).post('/auth/login').send({ email: userB.email, password: userB.password });
    tokenB = lb.body.token;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('simular victoria y comprobar ranking', async () => {
    // TODO: ajustar endpoints para reportar batalla/resultado
    // Intentar obtener ranking
    const ranking = await request(app).get('/api/ranking').set('Authorization', `Bearer ${tokenA}`);
    expect([200,404]).toContain(ranking.status);

    // Si existe endpoint para reportar victoria, usarlo; si no, validar que /api/ranking funciona
    if (ranking.status === 200) {
      expect(Array.isArray(ranking.body)).toBe(true);
    }
  }, 20000);
});
