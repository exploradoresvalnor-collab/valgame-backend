"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
// Build raw endpoint like app.ts does
const payment_service_1 = __importDefault(require("../../../src/services/payment.service"));
// Mocks de modelos
const userSave = jest.fn().mockResolvedValue(true);
const UserFindById = jest.fn().mockResolvedValue({ _id: 'u1', val: 0, save: userSave });
jest.mock('../../../src/models/User', () => ({
    User: { findById: (...args) => UserFindById(...args) }
}));
const userPackageCreate = jest.fn().mockResolvedValue(true);
jest.mock('../../../src/models/UserPackage', () => ({
    __esModule: true,
    default: { create: (...args) => userPackageCreate(...args) }
}));
const notificationCreate = jest.fn().mockResolvedValue({ _id: 'n1' });
jest.mock('../../../src/models/Notification', () => ({
    Notification: { create: (...args) => notificationCreate(...args) }
}));
// Mock de Purchase como clase instanciable + estático findOne (evitar hoisting)
const purchaseSave = jest.fn().mockResolvedValue(true);
const PurchaseFindOne = jest.fn();
jest.mock('../../../src/models/Purchase', () => {
    const Purchase = function (doc) {
        Object.assign(this, doc);
        this._id = 'p1';
        this.save = purchaseSave;
    };
    Purchase.findOne = (...args) => PurchaseFindOne(...args);
    return { Purchase };
});
// Espías de Realtime
const notifyPaymentStatus = jest.fn();
const notifyNotificationNew = jest.fn();
jest.mock('../../../src/services/realtime.service', () => ({
    RealtimeService: class {
        constructor() {
            this.notifyPaymentStatus = (...args) => notifyPaymentStatus(...args);
            this.notifyNotificationNew = (...args) => notifyNotificationNew(...args);
        }
        static getInstance() { return new this(); }
    }
}));
describe('payment webhook -> payments:status & notification:new', () => {
    const app = (0, express_1.default)();
    app.post('/webhook', express_1.default.raw({ type: 'application/json' }), (req, res) => payment_service_1.default.handleWebhook(req, res));
    beforeEach(() => {
        jest.clearAllMocks();
        // si hay secreto, la verificación fallaría en tests; asegurar bypass
        delete process.env.PAYMENT_WEBHOOK_SECRET;
        // Reaplicar implementación del mock tras resetMocks global
        UserFindById.mockResolvedValue({ _id: 'u1', val: 0, save: userSave });
    });
    it('status=succeeded crea compra, acredita VAL, emite payments:status=confirmed y notification:new', async () => {
        PurchaseFindOne.mockResolvedValue(null);
        const payload = {
            externalPaymentId: 'ext-1',
            status: 'succeeded',
            userId: 'u1',
            paqueteId: 'pkg1',
            valorPagadoUSDT: 10,
            valRecibido: 100,
            onchainTxHash: '0xabc'
        };
        const res = await (0, supertest_1.default)(app)
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
        PurchaseFindOne.mockResolvedValue(null);
        const payload = {
            externalPaymentId: 'ext-2',
            status: 'failed',
            userId: 'u1',
            paqueteId: 'pkg1',
            valorPagadoUSDT: 10,
            valRecibido: 100
        };
        const res = await (0, supertest_1.default)(app)
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
