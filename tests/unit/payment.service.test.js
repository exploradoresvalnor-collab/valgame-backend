"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const Purchase_1 = require("../../src/models/Purchase");
const mongoose_1 = __importDefault(require("mongoose"));
describe('payment.service.handleWebhook (unit/e2e-lite)', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        // Usar MongoMemoryServer para tests unitarios
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose_1.default.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    });
    afterAll(async () => {
        await Purchase_1.Purchase.deleteMany({}).exec();
        await mongoose_1.default.disconnect();
    });
    it('should reject request with invalid signature when secret set', async () => {
        process.env.PAYMENT_WEBHOOK_SECRET = 'shhh';
        const payload = { externalPaymentId: 'X1', userId: new mongoose_1.default.Types.ObjectId().toString() };
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/payments/webhook')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(payload));
        expect(res.status).toBe(401);
    });
    it('should create a purchase when signature is not required (no secret)', async () => {
        delete process.env.PAYMENT_WEBHOOK_SECRET;
        const userId = new mongoose_1.default.Types.ObjectId();
        const payload = { externalPaymentId: 'X2', userId: userId.toString(), status: 'succeeded', valorPagadoUSDT: 1, valRecibido: 10 };
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/payments/webhook')
            .set('Content-Type', 'application/json')
            .send(payload);
        expect(res.status).toBe(200);
        const p = await Purchase_1.Purchase.findOne({ externalPaymentId: 'X2' }).exec();
        expect(p).toBeDefined();
        expect(p.paymentStatus).toBe('succeeded');
    }, 10000);
});
