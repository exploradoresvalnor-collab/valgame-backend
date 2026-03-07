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
const setup_1 = require("../e2e/setup");
let mongod;
let app;
globals_1.jest.setTimeout(20000);
(0, globals_1.describe)('Shop - buy-val', () => {
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('POST /api/shop/buy-val should start checkout and create a pending Purchase', async () => {
        try {
            // registrar y autenticar usuario
            const userRes = await (0, supertest_1.default)(app).post('/auth/register').send({ email: `buyval${Date.now()}@test.com`, username: `buyval${Date.now()}`, password: 'StrongPass1!' }).expect(201);
            const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
            const username = `buyval${Date.now()}`; // same pattern as registration; note registration used Date.now() inline, we can't reproduce exact, so fallback: find by partial match
            // Buscar por username derivado del email we used
            const user = await User.findOne({ email: { $regex: '^buyval' } });
            await (0, supertest_1.default)(app).get(`/auth/verify/${user.verificationToken}`).expect(200);
            const login = await (0, supertest_1.default)(app).post('/auth/login').send({ email: user.email, password: 'StrongPass1!' }).expect(200);
            const token = login.body.token;
            console.log('DEBUG user token:', token);
            // Tomar un package del seed
            const { default: Package } = await Promise.resolve().then(() => __importStar(require('../../src/models/Package')));
            const pkg = await Package.findOne();
            (0, globals_1.expect)(pkg).toBeDefined();
            const pkgId = pkg._id.toString();
            // Llamar endpoint
            const res = await (0, supertest_1.default)(app).post('/api/shop/buy-val').set('Authorization', `Bearer ${token}`).send({ packageId: pkgId });
            console.log('DEBUG buy-val response:', res.status, JSON.stringify(res.body));
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.checkoutUrl).toBeDefined();
            (0, globals_1.expect)(res.body.externalPaymentId).toBeDefined();
            (0, globals_1.expect)(res.body.purchaseId).toBeDefined();
            // Verificar que la Purchase fue creada en DB
            const { Purchase } = await Promise.resolve().then(() => __importStar(require('../../src/models/Purchase')));
            const created = await Purchase.findOne({ externalPaymentId: res.body.externalPaymentId });
            (0, globals_1.expect)(created).toBeDefined();
            (0, globals_1.expect)(created?.paymentStatus).toBe('pending');
        }
        catch (err) {
            console.error('TEST ERROR:', err);
            throw err;
        }
    });
});
