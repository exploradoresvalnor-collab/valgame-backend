import request from 'supertest';
import app from '../../src/app';
import bcrypt from 'bcryptjs';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';
import mongoose from 'mongoose';

import { User } from '../../src/models/User';
import PackageModel from '../../src/models/Package';
import UserPackage from '../../src/models/UserPackage';
import { Purchase } from '../../src/models/Purchase';

describe('E2E: purchase -> webhook -> open -> inventory', () => {
  let mongod: any;

  beforeAll(async () => {
    console.log('[E2E] starting setupTestDB');
    mongod = await setupTestDB();
    console.log('[E2E] setupTestDB done');
    await seedTestData();
    console.log('[E2E] seedTestData done');
  }, 60000);

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('processes a purchase webhook and allows opening the assigned package', async () => {
    // Crear usuario
    const password = 'TestPass123!';
    const passwordHash = await bcrypt.hash(password, 8);
    const user = await User.create({ email: 'e2e@user.test', username: 'e2euser', passwordHash, isVerified: true } as any);

    // Encontrar paquete creado por seedTestData
    const pkg = await PackageModel.findOne({ nombre: 'Paquete Pionero' }).exec();
    expect(pkg).toBeDefined();

    // Simular webhook de pago succeeded
    const externalPaymentId = `E2E-${Date.now()}`;
    const payload = {
      externalPaymentId,
      status: 'succeeded',
      userId: (user._id as any).toString(),
      paqueteId: (pkg!._id as any).toString(),
      valorPagadoUSDT: 0,
      valRecibido: 100
    };

    const webhookRes = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(payload));

    expect(webhookRes.status).toBe(200);
    expect(webhookRes.body.ok).toBeTruthy();

    // Verificar que la Purchase fue creada y tiene status succeeded
    const purchase = await Purchase.findOne({ externalPaymentId }).exec();
    expect(purchase).toBeDefined();
    expect(purchase!.paymentStatus).toBe('succeeded');

    // Verificar que se creó UserPackage para el usuario
    const up = await UserPackage.findOne({ userId: user._id }).exec();
    expect(up).toBeDefined();

    // Login para obtener token
    const loginRes = await request(app).post('/auth/login').send({ email: 'e2e@user.test', password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // Abrir el paquete asignado
    const openRes = await request(app)
      .post(`/api/user-packages/${up!._id.toString()}/open`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(openRes.status).toBe(200);
    expect(openRes.body.ok).toBeTruthy();

    // Verificar efectos: UserPackage eliminado y PurchaseLog creado
    const still = await UserPackage.findById(up!._id).exec();
    expect(still).toBeNull();

    // Verificar que el usuario recibió VAL
    const refreshed = await User.findById(user._id).exec();
    expect(refreshed).toBeDefined();
    expect(refreshed!.val).toBeGreaterThanOrEqual(100);
  }, 60000);
});

export {};
