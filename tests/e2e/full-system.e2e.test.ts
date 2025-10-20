import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';
import { User } from '../../src/models/User';

let mongod: MongoMemoryServer;
let app: any;

describe('Sistema Completo E2E', () => {
  let authToken: string;
  let characterId: string;
  let itemId: string = '';
  let listingId: string;

  const testUser = {
    email: `test${Date.now()}@test.com`,
    username: `testuser${Date.now()}`,
    password: 'test1234'
  };

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  describe('1. Sistema de Onboarding y Autenticación', () => {
    it('debería registrar un nuevo usuario', async () => {
      const res = await request(app).post('/auth/register').send(testUser);
      expect(res.status).toBe(201);
    });

    it('debería verificar la cuenta, recibir el paquete, iniciar sesión y obtener un token', async () => {
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeDefined();
      const token = user?.verificationToken;
      expect(token).toBeDefined();

      const verifyRes = await request(app).get(`/auth/verify/${token}`);
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.package.delivered).toBe(true);

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.token).toBeDefined();
      authToken = loginRes.body.token;
    });

    it('debería obtener el inventario y personaje iniciales correctamente', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.inventarioConsumibles).toBeDefined();
      expect(res.body.personajes).toBeDefined();
      expect(res.body.personajes).toHaveLength(1);

      characterId = res.body.personajes[0]._id;
      itemId = res.body.inventarioConsumibles[0].consumableId;
      expect(characterId).toBeDefined();
      expect(itemId).toBeDefined();
    });
  });

  describe('2. Sistema de Items', () => {
    it('debería usar un consumible', async () => {
      const res = await request(app)
        .post(`/api/characters/${characterId}/use-consumable`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemId: itemId });

      expect(res.status).toBe(200);
    });
  });

  describe('3. Mecánicas de Supervivencia', () => {
    it('debería curar un personaje', async () => {
      const res = await request(app)
        .post(`/api/characters/${characterId}/heal`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 10 });

      expect(res.status).toBe(200);
    });

    it('debería revivir un personaje', async () => {
      const res = await request(app)
        .post(`/api/characters/${characterId}/revive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('4. Sistema de Marketplace', () => {
    it('debería crear un listing', async () => {
      const res = await request(app)
        .post('/api/marketplace/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemId: itemId, precio: 100, cantidad: 1 });

      expect(res.status).toBe(201);
      listingId = res.body.listing.id;
    });

    it('debería buscar listings', async () => {
      const res = await request(app)
        .get('/api/marketplace/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'consumible', precioMax: 200 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
    });

    it('debería fallar al intentar comprar su propio item', async () => {
      const res = await request(app)
        .post(`/api/marketplace/listings/${listingId}/buy`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('5. Rate Limiting', () => {
    it('debería bloquear después de muchos intentos de login fallidos', async () => {
      const nonExistentEmail = `nouser${Date.now()}@test.com`;
      for (let i = 0; i <= 5; i++) {
        const res = await request(app)
          .post('/auth/login')
          .send({ email: nonExistentEmail, password: 'wrongpass' });

        if (i === 5) {
          expect(res.status).toBe(429);
        }
      }
    }, 10000);
  });

  describe('6. Sistema de Evolución', () => {
    it('debería evolucionar un personaje', async () => {
      const res = await request(app)
        .post(`/api/characters/${characterId}/evolve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });
});
