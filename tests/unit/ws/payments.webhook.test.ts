import express from 'express';
import request from 'supertest';

// Build raw endpoint like app.ts does
import paymentService from '../../../src/services/payment.service';

// Mocks de modelos
const userSave = jest.fn().mockResolvedValue(true);
const UserFindById = jest.fn().mockResolvedValue({ _id: 'u1', val: 0, save: userSave });
jest.mock('../../../src/models/User', () => ({
  User: { findById: (...args: any[]) => (UserFindById as any)(...args) }
}));

const userPackageCreate = jest.fn().mockResolvedValue(true);
jest.mock('../../../src/models/UserPackage', () => ({
  __esModule: true,
  default: { create: (...args: any[]) => (userPackageCreate as any)(...args) }
}));

const notificationCreate = jest.fn().mockResolvedValue({ _id: 'n1' });
jest.mock('../../../src/models/Notification', () => ({
  Notification: { create: (...args: any[]) => (notificationCreate as any)(...args) }
}));

// Mock de Purchase como clase instanciable + estático findOne (evitar hoisting)
const purchaseSave = jest.fn().mockResolvedValue(true);
const PurchaseFindOne = jest.fn();
jest.mock('../../../src/models/Purchase', () => {
  const Purchase: any = function (this: any, doc: any) {
    Object.assign(this, doc);
    this._id = 'p1';
    this.save = purchaseSave;
  };
  Purchase.findOne = (...args: any[]) => (PurchaseFindOne as any)(...args);
  return { Purchase };
});

// Espías de Realtime
const notifyPaymentStatus = jest.fn();
const notifyNotificationNew = jest.fn();
jest.mock('../../../src/services/realtime.service', () => ({
  RealtimeService: class {
    static getInstance(){ return new (this as any)(); }
    notifyPaymentStatus = (...args: any[]) => (notifyPaymentStatus as any)(...args);
    notifyNotificationNew = (...args: any[]) => (notifyNotificationNew as any)(...args);
  }
}));

describe('payment webhook -> payments:status & notification:new', () => {
  const app = express();
  app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => paymentService.handleWebhook(req as any, res as any));

  beforeEach(() => {
    jest.clearAllMocks();
    // si hay secreto, la verificación fallaría en tests; asegurar bypass
    delete (process.env as any).PAYMENT_WEBHOOK_SECRET;
    // Reaplicar implementación del mock tras resetMocks global
    (UserFindById as any).mockResolvedValue({ _id: 'u1', val: 0, save: userSave });
  });

  it('status=succeeded crea compra, acredita VAL, emite payments:status=confirmed y notification:new', async () => {
    (PurchaseFindOne as any).mockResolvedValue(null);
    const payload = {
      externalPaymentId: 'ext-1',
      status: 'succeeded',
      userId: 'u1',
      paqueteId: 'pkg1',
      valorPagadoUSDT: 10,
      valRecibido: 100,
      onchainTxHash: '0xabc'
    };
    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send(Buffer.from(JSON.stringify(payload)));

    expect(res.status).toBe(200);
    expect(purchaseSave).toHaveBeenCalled();
    expect(UserFindById).toHaveBeenCalledWith('u1');
    expect(userSave).toHaveBeenCalled();
    expect(userPackageCreate).toHaveBeenCalled();
    expect(notifyPaymentStatus).toHaveBeenCalled();
    expect(notifyPaymentStatus.mock.calls[0][1].state).toBe('confirmed');
    expect(notificationCreate).toHaveBeenCalled();
    expect(notifyNotificationNew).toHaveBeenCalled();
  });

  it('status=failed no acredita VAL ni notificación, emite payments:status=failed', async () => {
    (PurchaseFindOne as any).mockResolvedValue(null);
    const payload = {
      externalPaymentId: 'ext-2',
      status: 'failed',
      userId: 'u1',
      paqueteId: 'pkg1',
      valorPagadoUSDT: 10,
      valRecibido: 100
    };
    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send(Buffer.from(JSON.stringify(payload)));

    expect(res.status).toBe(200);
    expect(purchaseSave).toHaveBeenCalled();
    expect(UserFindById).not.toHaveBeenCalled();
    expect(notificationCreate).not.toHaveBeenCalled();
    expect(notifyNotificationNew).not.toHaveBeenCalled();
    expect(notifyPaymentStatus).toHaveBeenCalled();
    expect(notifyPaymentStatus.mock.calls[0][1].state).toBe('failed');
  });
});
