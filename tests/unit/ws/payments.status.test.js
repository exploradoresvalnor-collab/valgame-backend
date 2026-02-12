"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
// Mock auth middleware to inject userId
jest.mock('../../../src/middlewares/auth', () => ({
    auth: (req, _res, next) => { req.userId = '507f1f77bcf86cd799439011'; next(); }
}));
// Spy RealtimeService
const notifyPaymentStatus = jest.fn();
jest.mock('../../../src/services/realtime.service', () => ({
    RealtimeService: class {
        constructor() {
            this.notifyPaymentStatus = notifyPaymentStatus;
        }
        static getInstance() { return new this(); }
    }
}));
// Router under test
const payments_routes_1 = __importDefault(require("../../../src/routes/payments.routes"));
describe('payments:status events', () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/payments', payments_routes_1.default);
    beforeEach(() => {
        notifyPaymentStatus.mockClear();
    });
    it('emite payments:status=initiated al iniciar blockchain (stub)', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/payments/blockchain/initiate')
            .send({ packageId: 'pkg1', chain: 'evm', amountUSDT: 10, walletAddress: '0xabc' });
        expect(res.status).toBe(200);
        expect(notifyPaymentStatus).toHaveBeenCalledTimes(1);
        const args = notifyPaymentStatus.mock.calls[0];
        expect(args[0]).toBe('507f1f77bcf86cd799439011');
        expect(args[1]).toMatchObject({ provider: 'blockchain', state: 'initiated' });
    });
});
