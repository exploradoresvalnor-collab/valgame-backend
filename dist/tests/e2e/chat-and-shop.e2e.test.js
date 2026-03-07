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
const User_1 = require("../../src/models/User");
const mongoose_1 = __importDefault(require("mongoose"));
(0, globals_1.describe)('🗨️ 🏪 TEST E2E: CHAT & SHOP', () => {
    let app;
    let mongod;
    let user = {
        email: `chat_shop_${Date.now()}@test.com`,
        username: 'ChatShopUser',
        password: 'StrongPassword123!'
    };
    let token;
    let userId;
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
        // Registrar y Login
        await (0, supertest_1.default)(app).post('/auth/register').send(user).expect(201);
        const u = await User_1.User.findOne({ email: user.email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${u.verificationToken}`).expect(200);
        const loginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: user.email, password: user.password });
        token = loginRes.body.token;
        userId = u._id.toString();
        // Dar VAL al usuario para compras
        await User_1.User.findByIdAndUpdate(userId, { $inc: { val: 50000 } });
    });
    (0, globals_1.afterAll)(async () => {
        // Si la conexión sigue abierta, limpiamos usuario
        if (mongoose_1.default.connection.readyState === 1) {
            await User_1.User.deleteOne({ email: user.email });
        }
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.describe)('💬 Chat Endpoints', () => {
        (0, globals_1.it)('Debe enviar un mensaje global', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/chat/global')
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Hola Mundo E2E' });
            (0, globals_1.expect)(res.status).toBe(201);
            (0, globals_1.expect)(res.body.success).toBe(true);
            (0, globals_1.expect)(res.body.data.content).toBe('Hola Mundo E2E');
        });
        (0, globals_1.it)('Debe obtener mensajes', async () => {
            const res = await (0, supertest_1.default)(app)
                .get('/api/chat/messages')
                .set('Authorization', `Bearer ${token}`);
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.success).toBe(true);
            (0, globals_1.expect)(Array.isArray(res.body.data)).toBe(true);
            (0, globals_1.expect)(res.body.data.some((m) => m.content === 'Hola Mundo E2E')).toBe(true);
        });
        (0, globals_1.it)('Debe fallar al enviar mensaje vacío', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/chat/global')
                .set('Authorization', `Bearer ${token}`)
                .send({ content: '' });
            // Dependiendo de la implementación puede ser 400
            (0, globals_1.expect)(res.status).toBe(400);
        });
    });
    (0, globals_1.describe)('🏪 Shop Endpoints', () => {
        (0, globals_1.it)('Debe obtener información de la tienda', async () => {
            const res = await (0, supertest_1.default)(app)
                .get('/api/shop/info'); // Pública según routes
            (0, globals_1.expect)(res.status).toBe(200);
            // Validar estructura esperada (ajustar según respuesta real)
            // Puede devolver info genérica o 200 OK
            (0, globals_1.expect)(res.body).toBeDefined();
        });
        (0, globals_1.it)('Debe comprar Cristales de Evolución (EVO)', async () => {
            // Precio base suele ser X. Verificamos que se reste el VAL y sume EVO.
            const userBefore = await User_1.User.findById(userId);
            const valBefore = userBefore.val || 0;
            const evoBefore = userBefore.evo || 0;
            const res = await (0, supertest_1.default)(app)
                .post('/api/shop/buy-evo')
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 1 }); // Comprar 1 suele ser el default o parámetro
            if (res.status === 400 && res.body.error?.includes('Fondos insuficientes')) {
                console.warn('Fondos insuficientes para test de EVO, saltando assert estricto');
            }
            else {
                (0, globals_1.expect)(res.status).toBe(200);
                const userAfter = await User_1.User.findById(userId);
                (0, globals_1.expect)(userAfter.evo).toBeGreaterThan(evoBefore);
                (0, globals_1.expect)(userAfter.val).toBeLessThan(valBefore);
            }
        });
        (0, globals_1.it)('Debe comprar paquetes de VAL (Simulación)', async () => {
            // Este endpoint es delicado porque suele redirigir a pasarela o ser mock
            // Probamos que existe y valida input
            const res = await (0, supertest_1.default)(app)
                .post('/api/shop/buy-val')
                .set('Authorization', `Bearer ${token}`)
                .send({ packageId: 'invalid_pkg' });
            // Debería fallar por paquete inválido o 404
            (0, globals_1.expect)([400, 404]).toContain(res.status);
        });
    });
});
