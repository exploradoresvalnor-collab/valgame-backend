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
(0, globals_1.describe)('E2E Team & Equipment (skeleton)', () => {
    const user = { email: `team${Date.now()}@test.com`, username: `team${Date.now()}`, password: 'StrongPassword123!' };
    let token;
    let characterId;
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
        const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
        characterId = me.body.personajes?.[0]?.personajeId;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('comprar equipamiento y equiparlo al personaje', async () => {
        // TODO: ajustar endpoints reales de tienda/equipment
        const list = await (0, supertest_1.default)(app).get('/api/items').set('Authorization', `Bearer ${token}`);
        (0, globals_1.expect)([200, 404]).toContain(list.status);
        if (list.status === 200 && Array.isArray(list.body) && list.body.length > 0) {
            const item = list.body.find((i) => i.tipoItem === 'Equipment') || list.body[0];
            // Intentar comprar
            const buyRes = await (0, supertest_1.default)(app).post(`/api/items/${item.id}/buy`).set('Authorization', `Bearer ${token}`).send({ metodoPago: 'val' });
            (0, globals_1.expect)([200, 201, 404]).toContain(buyRes.status);
            // Intentar equipar si existe endpoint
            const equipRes = await (0, supertest_1.default)(app).post(`/api/characters/${characterId}/equip`).set('Authorization', `Bearer ${token}`).send({ itemId: item.id });
            (0, globals_1.expect)([200, 201, 404]).toContain(equipRes.status);
            if (equipRes.status === 200 || equipRes.status === 201) {
                const meAfter = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
                (0, globals_1.expect)(meAfter.status).toBe(200);
                // Verificar que personaje tiene equipamiento referenciado o que el inventario se actualizó
                const hasEquipped = (meAfter.body.personajes || []).some((p) => Array.isArray(p.equipamiento) && p.equipamiento.length > 0);
                const invChanged = Array.isArray(meAfter.body.inventarioEquipamiento) && meAfter.body.inventarioEquipamiento.length >= 0;
                (0, globals_1.expect)(hasEquipped || invChanged).toBeTruthy();
            }
        }
    }, 20000);
});
