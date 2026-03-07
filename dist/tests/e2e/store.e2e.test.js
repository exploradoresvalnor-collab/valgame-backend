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
(0, globals_1.describe)('E2E Store / Paquetes (skeleton)', () => {
    const user = { email: `store${Date.now()}@test.com`, username: `store${Date.now()}`, password: 'StrongPassword123!' };
    let token;
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
        await (0, supertest_1.default)(app).post('/auth/register').send(user).expect(201);
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const u = await User.findOne({ email: user.email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${u.verificationToken}`).expect(200);
        const loginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: user.email, password: user.password });
        token = loginRes.body.token;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('comprar paquete y abrirlo asignando items y/o personaje', async () => {
        // Usar rutas reales: GET /api/packages, POST /api/user-packages/agregar, POST /api/user-packages/open
        const list = await (0, supertest_1.default)(app).get('/api/packages').set('Authorization', `Bearer ${token}`);
        (0, globals_1.expect)([200, 404]).toContain(list.status);
        if (list.status === 200 && Array.isArray(list.body) && list.body.length > 0) {
            const pkg = list.body[0];
            // Obtener userId desde /api/users/me
            const meBefore = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            (0, globals_1.expect)(meBefore.status).toBe(200);
            const userId = meBefore.body.id || meBefore.body._id;
            // Agregar paquete al usuario
            const addRes = await (0, supertest_1.default)(app)
                .post('/api/user-packages/agregar')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId, paqueteId: pkg._id || pkg.id || pkg.id });
            (0, globals_1.expect)([200, 201]).toContain(addRes.status);
            // Abrir el paquete usando el endpoint de user-packages
            const openRes = await (0, supertest_1.default)(app)
                .post('/api/user-packages/open')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId });
            (0, globals_1.expect)([200, 201]).toContain(openRes.status);
            const assigned = openRes.body && openRes.body.assigned ? openRes.body.assigned : [];
            // Validaciones: user recibe val o items o personajes
            const meAfter = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            (0, globals_1.expect)(meAfter.status).toBe(200);
            const body = meAfter.body;
            const gotVal = typeof body.val === 'number' && body.val >= 0;
            const gotItems = Array.isArray(body.inventarioConsumibles) && body.inventarioConsumibles.length > 0;
            const gotChars = Array.isArray(body.personajes) && body.personajes.length > 0;
            (0, globals_1.expect)(gotVal || gotItems || gotChars).toBeTruthy();
            // Si el paquete tiene categorias_garantizadas, al menos un personaje asignado debe cumplir la categoría
            if (pkg.categorias_garantizadas && Array.isArray(pkg.categorias_garantizadas) && pkg.categorias_garantizadas.length > 0) {
                const guaranteed = pkg.categorias_garantizadas;
                const hasGuaranteed = (body.personajes || []).some((p) => guaranteed.includes(p.rango));
                (0, globals_1.expect)(hasGuaranteed).toBeTruthy();
            }
            // Validaciones concretas basadas en el seed: Paquete Pionero tiene val_reward: 50 y items_reward incluye potionId
            if (pkg.nombre === 'Paquete Pionero') {
                // En seed el Paquete Pionero otorga 100 VAL
                (0, globals_1.expect)(pkg.val_reward).toBe(100);
                const potionId = '68dc525adb5c735854b5659d';
                const itemsReward = pkg.items_reward || [];
                // items_reward puede contener ObjectId, compararemos en strings
                const itemsStr = itemsReward.map((it) => String(it));
                (0, globals_1.expect)(itemsStr.includes(potionId)).toBeTruthy();
                // Además, tras abrir, usuario debe tener al menos una instancia de la poción en inventarioConsumibles
                const hasPotion = (body.inventarioConsumibles || []).some((c) => String(c.consumableId) === potionId);
                (0, globals_1.expect)(hasPotion).toBeTruthy();
            }
        }
    }, 20000);
});
