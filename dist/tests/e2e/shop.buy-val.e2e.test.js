"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const setup_1 = require("./setup");
let mongod;
let app;
globals_1.jest.setTimeout(30000);
(0, globals_1.describe)('E2E Shop buy-val + webhook', () => {
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('should complete purchase flow when webhook reports success', async () => {
        // registrar + verificar + login
        const email = `checkout${Date.now()}@test.com`;
        await (0, supertest_1.default)(app).post('/auth/register').send({ email, username: email, password: 'StrongPass1!' }).expect(201);
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const user = await User.findOne({ email }); // registration uses same email variable
        await (0, supertest_1.default)(app).get(`/auth/verify/${user.verificationToken}`).expect(200);
        const login = await (0, supertest_1.default)(app).post('/auth/login').send({ email, password: 'StrongPass1!' }).expect(200);
        const token = login.body.token;
        const { default: Package } = await Promise.resolve().then(() => __importStar(require('../../src/models/Package')));
        const pkg = await Package.findOne();
        (0, globals_1.expect)(pkg).toBeDefined();
        const pkgId = pkg._id.toString();
        // iniciar checkout
        const res = await (0, supertest_1.default)(app).post('/api/shop/buy-val').set('Authorization', `Bearer ${token}`).send({ packageId: pkgId }).expect(200);
        const externalPaymentId = res.body.externalPaymentId;
        (0, globals_1.expect)(externalPaymentId).toBeDefined();
        // Simular webhook de provider informando succeeded
        const webhookPayload = {
            externalPaymentId,
            status: 'succeeded',
            userId: String(user._id),
            paqueteId: pkgId,
            valorPagadoUSDT: pkg.precio_usdt,
            valRecibido: pkg.val_reward || 0
        };
        const webhookRes = await (0, supertest_1.default)(app).post('/api/payments/webhook').send(webhookPayload).expect(200);
        (0, globals_1.expect)(webhookRes.body.ok).toBe(true);
        // Verificar que user.val aumentó
        const refreshed = await User.findById(user._id);
        (0, globals_1.expect)(refreshed?.val).toBeGreaterThanOrEqual(user.val);
        // Verificar que Purchase paymentStatus es 'succeeded'
        const { Purchase } = await Promise.resolve().then(() => __importStar(require('../../src/models/Purchase')));
        const purchase = await Purchase.findOne({ externalPaymentId });
        (0, globals_1.expect)(purchase).toBeDefined();
        (0, globals_1.expect)(purchase?.paymentStatus).toBe('succeeded');
    });
});
