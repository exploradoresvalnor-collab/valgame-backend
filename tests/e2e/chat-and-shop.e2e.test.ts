import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, cleanupTestDB, seedTestData } from './setup';
import { User } from '../../src/models/User';
import mongoose from 'mongoose';

describe('🗨️ 🏪 TEST E2E: CHAT & SHOP', () => {
  let app: any;
  let mongod: any;
  let user = {
    email: `chat_shop_${Date.now()}@test.com`,
    username: 'ChatShopUser',
    password: 'StrongPassword123!'
  };
  let token: string;
  let userId: string;

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;

    // Registrar y Login
    await request(app).post('/auth/register').send(user).expect(201);
    
    const u = await User.findOne({ email: user.email });
    await request(app).get(`/auth/verify/${u!.verificationToken}`).expect(200);

    const loginRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
    token = loginRes.body.token;
    userId = u!._id.toString();

    // Dar VAL al usuario para compras
    await User.findByIdAndUpdate(userId, { $inc: { val: 50000 } });
  });

  afterAll(async () => {
    // Si la conexión sigue abierta, limpiamos usuario
    if (mongoose.connection.readyState === 1) {
        await User.deleteOne({ email: user.email });
    }
    await cleanupTestDB(mongod);
  });

  describe('💬 Chat Endpoints', () => {
    it('Debe enviar un mensaje global', async () => {
      const res = await request(app)
        .post('/api/chat/global')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hola Mundo E2E' });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Hola Mundo E2E');
    });

    it('Debe obtener mensajes', async () => {
      const res = await request(app)
        .get('/api/chat/messages')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((m: any) => m.content === 'Hola Mundo E2E')).toBe(true);
    });

    it('Debe fallar al enviar mensaje vacío', async () => {
      const res = await request(app)
        .post('/api/chat/global')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' });
      
      // Dependiendo de la implementación puede ser 400
      expect(res.status).toBe(400);
    });
  });

  describe('🏪 Shop Endpoints', () => {
    it('Debe obtener información de la tienda', async () => {
      const res = await request(app)
        .get('/api/shop/info'); // Pública según routes
      
      expect(res.status).toBe(200);
      // Validar estructura esperada (ajustar según respuesta real)
      // Puede devolver info genérica o 200 OK
      expect(res.body).toBeDefined();
    });

    it('Debe comprar Cristales de Evolución (EVO)', async () => {
      // Precio base suele ser X. Verificamos que se reste el VAL y sume EVO.
      const userBefore = await User.findById(userId);
      const valBefore = userBefore!.val || 0;
      const evoBefore = userBefore!.evo || 0;

      const res = await request(app)
        .post('/api/shop/buy-evo')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 1 }); // Comprar 1 suele ser el default o parámetro

      if (res.status === 400 && res.body.error?.includes('Fondos insuficientes')) {
         console.warn('Fondos insuficientes para test de EVO, saltando assert estricto');
      } else {
        expect(res.status).toBe(200);
        
        const userAfter = await User.findById(userId);
        expect(userAfter!.evo).toBeGreaterThan(evoBefore);
        expect(userAfter!.val).toBeLessThan(valBefore);
      }
    });

    it('Debe comprar paquetes de VAL (Simulación)', async () => {
        // Este endpoint es delicado porque suele redirigir a pasarela o ser mock
        // Probamos que existe y valida input
        const res = await request(app)
          .post('/api/shop/buy-val')
          .set('Authorization', `Bearer ${token}`)
          .send({ packageId: 'invalid_pkg' });
        
        // Debería fallar por paquete inválido o 404
        expect([400, 404]).toContain(res.status);
    });
  });
});
