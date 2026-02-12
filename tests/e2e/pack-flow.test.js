"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const setup_1 = require("./setup");
const User_1 = require("../../src/models/User");
const Package_1 = __importDefault(require("../../src/models/Package"));
const UserPackage_1 = __importDefault(require("../../src/models/UserPackage"));
const Purchase_1 = require("../../src/models/Purchase");
describe('E2E: purchase -> webhook -> open -> inventory', () => {
    let mongod;
    beforeAll(async () => {
        console.log('[E2E] starting setupTestDB');
        mongod = await (0, setup_1.setupTestDB)();
        console.log('[E2E] setupTestDB done');
        await (0, setup_1.seedTestData)();
        console.log('[E2E] seedTestData done');
    }, 60000);
    afterAll(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    it('processes a purchase webhook and allows opening the assigned package', async () => {
        // Crear usuario
        const password = 'TestPass123!';
        const passwordHash = await bcryptjs_1.default.hash(password, 8);
        const user = await User_1.User.create({ email: 'e2e@user.test', username: 'e2euser', passwordHash, isVerified: true });
        // Encontrar paquete creado por seedTestData
        const pkg = await Package_1.default.findOne({ nombre: 'Paquete Pionero' }).exec();
        expect(pkg).toBeDefined();
        // Simular webhook de pago succeeded
        const externalPaymentId = `E2E-${Date.now()}`;
        const payload = {
            externalPaymentId,
            status: 'succeeded',
            userId: user._id.toString(),
            paqueteId: pkg._id.toString(),
            valorPagadoUSDT: 0,
            valRecibido: 100
        };
        const webhookRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/payments/webhook')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(payload));
        expect(webhookRes.status).toBe(200);
        expect(webhookRes.body.ok).toBeTruthy();
        // Verificar que la Purchase fue creada y tiene status succeeded
        const purchase = await Purchase_1.Purchase.findOne({ externalPaymentId }).exec();
        expect(purchase).toBeDefined();
        expect(purchase.paymentStatus).toBe('succeeded');
        // Verificar que se creó UserPackage para el usuario
        const up = await UserPackage_1.default.findOne({ userId: user._id }).exec();
        expect(up).toBeDefined();
        // Login para obtener token
        const loginRes = await (0, supertest_1.default)(app_1.default).post('/auth/login').send({ email: 'e2e@user.test', password });
        expect(loginRes.status).toBe(200);
        const token = loginRes.body.token;
        expect(token).toBeDefined();
        // Abrir el paquete asignado
        const openRes = await (0, supertest_1.default)(app_1.default)
            .post(`/api/user-packages/${up._id.toString()}/open`)
            .set('Authorization', `Bearer ${token}`)
            .send();
        expect(openRes.status).toBe(200);
        expect(openRes.body.ok).toBeTruthy();
        // Verificar efectos: UserPackage eliminado y PurchaseLog creado
        const still = await UserPackage_1.default.findById(up._id).exec();
        expect(still).toBeNull();
        // Verificar que el usuario recibió VAL
        const refreshed = await User_1.User.findById(user._id).exec();
        expect(refreshed).toBeDefined();
        expect(refreshed.val).toBeGreaterThanOrEqual(100);
    }, 60000);
});
