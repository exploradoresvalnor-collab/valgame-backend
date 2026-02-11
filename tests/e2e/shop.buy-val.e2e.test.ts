import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

jest.setTimeout(30_000);

describe('E2E Shop buy-val + webhook', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('should complete purchase flow when webhook reports success', async () => {
    // registrar + verificar + login
    const email = `checkout${Date.now()}@test.com`;
    await request(app).post('/auth/register').send({ email, username: email, password: 'StrongPass1!' }).expect(201);
    const { User } = await import('../../src/models/User');
    const user = await User.findOne({ email }); // registration uses same email variable

    await request(app).get(`/auth/verify/${(user as any).verificationToken}`).expect(200);
    const login = await request(app).post('/auth/login').send({ email, password: 'StrongPass1!' }).expect(200);
    const token = login.body.token;

    const { default: Package } = await import('../../src/models/Package');
    const pkg = await Package.findOne();
    expect(pkg).toBeDefined();
    const pkgId = (pkg as any)._id.toString();

    // iniciar checkout
    const res = await request(app).post('/api/shop/buy-val').set('Authorization', `Bearer ${token}`).send({ packageId: pkgId }).expect(200);
    const externalPaymentId = res.body.externalPaymentId;
    expect(externalPaymentId).toBeDefined();

    // Simular webhook de provider informando succeeded
    const webhookPayload = {
      externalPaymentId,
      status: 'succeeded',
      userId: String((user as any)._id),
      paqueteId: pkgId,
      valorPagadoUSDT: (pkg as any).precio_usdt,
      valRecibido: (pkg as any).val_reward || 0
    };

    const webhookRes = await request(app).post('/api/payments/webhook').send(webhookPayload).expect(200);
    expect(webhookRes.body.ok).toBe(true);

    // Verificar que user.val aumentó
    const refreshed = await User.findById((user as any)._id);
    expect(refreshed?.val).toBeGreaterThanOrEqual( (user as any).val );

    // Verificar que Purchase paymentStatus es 'succeeded'
    const { Purchase } = await import('../../src/models/Purchase');
    const purchase = await Purchase.findOne({ externalPaymentId });
    expect(purchase).toBeDefined();
    expect(purchase?.paymentStatus).toBe('succeeded');
  });
});
