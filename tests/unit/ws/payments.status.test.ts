import express from 'express';
import request from 'supertest';

// Mock auth middleware to inject userId
jest.mock('../../../src/middlewares/auth', () => ({
  auth: (req: any, _res: any, next: any) => { req.userId = '507f1f77bcf86cd799439011'; next(); }
}));

// Spy RealtimeService
const notifyPaymentStatus = jest.fn();
jest.mock('../../../src/services/realtime.service', () => ({
  RealtimeService: class {
    static getInstance(){ return new (this as any)(); }
    notifyPaymentStatus = notifyPaymentStatus;
  }
}));

// Router under test
import paymentsRoutes from '../../../src/routes/payments.routes';

describe('payments:status events', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/payments', paymentsRoutes);

  beforeEach(() => {
    notifyPaymentStatus.mockClear();
  });

  it('emite payments:status=initiated al iniciar blockchain (stub)', async () => {
    const res = await request(app)
      .post('/api/payments/blockchain/initiate')
      .send({ packageId: 'pkg1', chain: 'evm', amountUSDT: 10, walletAddress: '0xabc' });
    expect(res.status).toBe(200);
    expect(notifyPaymentStatus).toHaveBeenCalledTimes(1);
    const args = notifyPaymentStatus.mock.calls[0];
    expect(args[0]).toBe('507f1f77bcf86cd799439011');
    expect(args[1]).toMatchObject({ provider: 'blockchain', state: 'initiated' });
  });
});
