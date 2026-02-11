import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from '../e2e/setup';

let mongod: any;
let app: any;

jest.setTimeout(20_000);

describe('Shop - buy-val', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('POST /api/shop/buy-val should start checkout and create a pending Purchase', async () => {
    try {
      // registrar y autenticar usuario
      const userRes = await request(app).post('/auth/register').send({ email: `buyval${Date.now()}@test.com`, username: `buyval${Date.now()}`, password: 'StrongPass1!' }).expect(201);
      const { User } = await import('../../src/models/User');
    const username = `buyval${Date.now()}`; // same pattern as registration; note registration used Date.now() inline, we can't reproduce exact, so fallback: find by partial match
    // Buscar por username derivado del email we used
    const user = await User.findOne({ email: { $regex: '^buyval' } });

      await request(app).get(`/auth/verify/${(user as any).verificationToken}`).expect(200);
      const login = await request(app).post('/auth/login').send({ email: (user as any).email, password: 'StrongPass1!' }).expect(200);
      const token = login.body.token;
      console.log('DEBUG user token:', token);
      // Tomar un package del seed
      const { default: Package } = await import('../../src/models/Package');
      const pkg = await Package.findOne();
      expect(pkg).toBeDefined();
      const pkgId = (pkg as any)._id.toString();

      // Llamar endpoint
      const res = await request(app).post('/api/shop/buy-val').set('Authorization', `Bearer ${token}`).send({ packageId: pkgId });
      console.log('DEBUG buy-val response:', res.status, JSON.stringify(res.body));
      expect(res.status).toBe(200);
      expect(res.body.checkoutUrl).toBeDefined();
      expect(res.body.externalPaymentId).toBeDefined();
      expect(res.body.purchaseId).toBeDefined();

      // Verificar que la Purchase fue creada en DB
      const { Purchase } = await import('../../src/models/Purchase');
      const created = await Purchase.findOne({ externalPaymentId: res.body.externalPaymentId });
      expect(created).toBeDefined();
      expect(created?.paymentStatus).toBe('pending');
    } catch (err) {
      console.error('TEST ERROR:', err);
      throw err;
    }
  });
});
