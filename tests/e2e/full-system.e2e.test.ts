import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';

describe('Sistema Completo E2E', () => {
  let authToken: string;
  let characterId: string;
  let itemId: string = ''; // Inicializando para evitar error
  let listingId: string;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/valgame_test');
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Sistema de Onboarding', () => {
    it('debería registrar un nuevo usuario', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: `test${Date.now()}@test.com`,
          password: 'test1234'
        });

      expect(res.status).toBe(201);
      authToken = res.body.token;
    });

    it('debería tener el paquete del pionero', async () => {
      const res = await request(app)
        .get('/api/users/me/inventory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.inventarioConsumibles).toHaveLength(1);
      expect(res.body.characters).toHaveLength(1);
      characterId = res.body.characters[0].id;
    });
  });

  describe('2. Sistema de Items', () => {
    it('debería usar un consumible', async () => {
      const res = await request(app)
        .post(`/api/items/use/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('3. Mecánicas de Supervivencia', () => {
    it('debería curar un personaje', async () => {
      const res = await request(app)
        .post(`/api/characters/${characterId}/heal`)
        .set('Authorization', `Bearer ${authToken}`);

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
        .send({
          itemId,
          precio: 100,
          destacar: true
        });

      expect(res.status).toBe(201);
      listingId = res.body.id;
    });

    it('debería buscar listings', async () => {
      const res = await request(app)
        .get('/api/marketplace/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          type: 'equipamiento',
          precioMax: 1000
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
    });

    it('debería comprar un item', async () => {
      const res = await request(app)
        .post(`/api/marketplace/listings/${listingId}/buy`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('5. Rate Limiting', () => {
    it('debería bloquear después de muchos intentos', async () => {
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .post('/auth/login')
          .send({
            email: 'test@test.com',
            password: 'wrongpass'
          });

        if (i === 5) {
          expect(res.status).toBe(429);
        }
      }
    });
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