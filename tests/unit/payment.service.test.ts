import { handleWebhook } from '../../src/services/payment.service';
import request from 'supertest';
import app from '../../src/app';
import { Purchase } from '../../src/models/Purchase';
import mongoose from 'mongoose';

describe('payment.service.handleWebhook (unit/e2e-lite)', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    // conectar a memoria si es necesario (el entorno de tests del repo lo hace en setup)
    await mongoose.connect('mongodb://127.0.0.1:27017/valgame-test', { useNewUrlParser: true, useUnifiedTopology: true } as any);
  });

  afterAll(async () => {
    await Purchase.deleteMany({}).exec();
    await mongoose.disconnect();
  });

  it('should reject request with invalid signature when secret set', async () => {
    process.env.PAYMENT_WEBHOOK_SECRET = 'shhh';
  const payload = { externalPaymentId: 'X1', userId: new mongoose.Types.ObjectId().toString() };
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(payload));
    expect(res.status).toBe(401);
  });

  it('should create a purchase when signature is not required (no secret)', async () => {
    delete process.env.PAYMENT_WEBHOOK_SECRET;
  const userId = new mongoose.Types.ObjectId();
    const payload = { externalPaymentId: 'X2', userId: userId.toString(), status: 'succeeded', valorPagadoUSDT: 1, valRecibido: 10 };
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);
    expect(res.status).toBe(200);
    const p = await Purchase.findOne({ externalPaymentId: 'X2' }).exec();
    expect(p).toBeDefined();
    expect(p!.paymentStatus).toBe('succeeded');
  }, 10000);
});
