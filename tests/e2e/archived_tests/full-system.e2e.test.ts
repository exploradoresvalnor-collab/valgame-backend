import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import app from '../../src/app';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';
import { User } from '../../src/models/User';
import BaseCharacter from '../../src/models/BaseCharacter';

let mongod: any;

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
      expect(res.body.inventarioConsumibles.length).toBeGreaterThan(0); // Asegurarse de que hay al menos un ítem

      characterId = res.body.personajes[0].personajeId;
      itemId = res.body.inventarioConsumibles[0].consumableId;
      expect(characterId).toBeDefined();
      expect(itemId).toBeDefined();
    });
  });

  describe('2. Sistema de Marketplace', () => {
    it('debería crear un listing', async () => {
      const res = await request(app)
        .post('/api/marketplace/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemId: itemId, precio: 100, cantidad: 1 });

      expect(res.status).toBe(201);
      listingId = res.body.listing.id;

      // Validación: El item ya no debe estar en el inventario del usuario
      const user = await User.findOne({ email: testUser.email });
      const itemInInventory = user!.inventarioConsumibles.some(c => c.consumableId.toString() === itemId);
      expect(itemInInventory).toBe(false);
    });

    it('debería buscar listings', async () => {
      const res = await request(app)
        .get('/api/marketplace/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'consumible', precioMax: 200 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.listings.length).toBeGreaterThan(0);
    });

    it('debería fallar al intentar comprar su propio item', async () => {
      const res = await request(app)
        .post(`/api/marketplace/listings/${listingId}/buy`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('debería cancelar el listing para recuperar el item', async () => {
      const res = await request(app)
        .delete(`/api/marketplace/listings/${listingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Listado cancelado exitosamente/);

      // Validación: El item debe haber vuelto al inventario del usuario
      const user = await User.findOne({ email: testUser.email });
      const itemInInventory = user!.inventarioConsumibles.some(c => c.consumableId.toString() === itemId);
      expect(itemInInventory).toBe(true);
    });
  });

  describe('3. Sistema de Items', () => {
    it('debería usar un consumible', async () => {
      // Precondición: Dañar al personaje para que la poción tenga efecto
      const userPre = await User.findOne({ email: testUser.email });
      const charPre = userPre!.personajes.find(p => p.personajeId === characterId)!;
      charPre.saludActual = 50;
      await userPre!.save();

      const res = await request(app)
        .post(`/api/characters/${characterId}/use-consumable`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemId: itemId });

      expect(res.status).toBe(200);

      // Validación: Verificar que la salud del personaje aumentó y el item se consumió
      const userPost = await User.findOne({ email: testUser.email });
      const charPost = userPost!.personajes.find(p => p.personajeId === characterId)!;
      expect(charPost.saludActual).toBe(100); // 50 (daño) + 50 (poción)
      expect(userPost!.inventarioConsumibles.some(c => c.consumableId.toString() === itemId)).toBe(false);
    });
  });

  describe('4. Mecánicas de Supervivencia', () => {
    it('debería curar un personaje', async () => {
      // Precondición: Dañar al personaje primero
      const user = await User.findOne({ email: testUser.email });
      const character = user!.personajes.find(p => p.personajeId === characterId);
      character!.saludActual = 50;
      await user!.save();

      const res = await request(app)
        .post(`/api/characters/${characterId}/heal`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 10 });

      expect(res.status).toBe(200);

      // Validación: Verificar que la salud del personaje está al máximo
      const userPost = await User.findOne({ email: testUser.email });
      const charPost = userPost!.personajes.find(p => p.personajeId === characterId)!;
      expect(charPost.saludActual).toBe(charPost.saludMaxima);
    });

    it('debería revivir un personaje', async () => {
      // Precondición: Poner al personaje en estado 'herido' y asegurar fondos
      const user = await User.findOne({ email: testUser.email });
      const valAntes = 500;
      const character = user!.personajes.find(p => p.personajeId === characterId);
      character!.estado = 'herido';
      user!.val = valAntes; // Asegurar que hay suficiente VAL para revivir
      await user!.save();

      const res = await request(app)
        .post(`/api/characters/${characterId}/revive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200); // Asumiendo que el costo de revivir es 50

      // Validación: Verificar que el estado del personaje es 'saludable' y se cobró el VAL
      const userPost = await User.findOne({ email: testUser.email });
      const charPost = userPost!.personajes.find(p => p.personajeId === characterId)!;
      expect(charPost.estado).toBe('saludable');
      expect(userPost!.val).toBeLessThan(valAntes);
    });
  });

  describe('5. Rate Limiting', () => {
    it('debería bloquear después de muchos intentos de login fallidos', async () => {
      const nonExistentEmail = `nouser${Date.now()}@test.com`;

      // Para garantizar que el rate-limiter esté activo durante este test,
      // recargamos la instancia de la app con la variable de entorno habilitando el limiter.
      const originalFlag = process.env.TEST_ENABLE_RATE_LIMIT;
      process.env.TEST_ENABLE_RATE_LIMIT = 'true';
      // Forzar recarga del módulo app para que el middleware lea la nueva variable
      delete require.cache[require.resolve('../../src/app')];
      const reloadedApp = require('../../src/app').default || require('../../src/app');

      for (let i = 0; i <= 5; i++) {
        const res = await request(reloadedApp)
          .post('/auth/login')
          .send({ email: nonExistentEmail, password: 'wrongpass' });

        if (i === 5) {
          expect(res.status).toBe(429);
        }
      }

      // Restaurar flag original
      process.env.TEST_ENABLE_RATE_LIMIT = originalFlag;
    }, 10000);
  });

  describe('6. Sistema de Evolución', () => {
    it('debería evolucionar un personaje', async () => {
      // Precondición: Añadir una evolución al personaje base y cumplir los requisitos
      const baseChar = await BaseCharacter.findOne({ id: 'base_d_001' });
      if (baseChar) {
        baseChar.evoluciones = [{
          nombre: 'Explorador Veterano',
          etapa: 2,
          requisitos: { nivel: 10, val: 100, evo: 100 },
          stats: { atk: 10, vida: 120, defensa: 5 },
          multiplicador_base: 1.2,
          val_por_nivel_por_etapa: [1.2]
        }];
        await baseChar.save();
      }

      const user = await User.findOne({ email: testUser.email });
      const character = user!.personajes.find(p => p.personajeId === characterId);
      character!.nivel = 10; // Nivel requerido
      user!.val = 200;      // Recursos suficientes
      user!.evo = 200;      // Recursos suficientes
      await user!.save();

      const res = await request(app)
        .post(`/api/characters/${characterId}/evolve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      // Validación: Verificar que la etapa del personaje ha aumentado
      const userPost = await User.findOne({ email: testUser.email });
      const charPost = userPost!.personajes.find(p => p.personajeId === characterId)!;
      expect(charPost.etapa).toBe(2);
    });
  });
});
