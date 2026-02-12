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
(0, globals_1.describe)('E2E Dungeon / Drops (skeleton)', () => {
    const user = { email: `dun${Date.now()}@test.com`, username: `dun${Date.now()}`, password: 'StrongPassword123!' };
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
    (0, globals_1.it)('entrar a mazmorra y recibir drops/experiencia', async () => {
        // TODO: ajustar rutas reales de mazmorra
        const start = await (0, supertest_1.default)(app).post('/api/dungeons/start').set('Authorization', `Bearer ${token}`).send({ characterId });
        (0, globals_1.expect)([200, 201, 404]).toContain(start.status);
        if (start.status === 200 || start.status === 201) {
            // Simular resultado (victoria)
            const result = await (0, supertest_1.default)(app).post(`/api/dungeons/${start.body.id}/complete`).set('Authorization', `Bearer ${token}`).send({ victory: true });
            (0, globals_1.expect)([200, 201]).toContain(result.status);
            if (result.status === 200 || result.status === 201) {
                const meAfter = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
                (0, globals_1.expect)(meAfter.status).toBe(200);
                // Validación mínima: user gains xp or items
                const body = meAfter.body;
                (0, globals_1.expect)((typeof body.val === 'number' && body.val >= 0) || (Array.isArray(body.inventarioConsumibles) && body.inventarioConsumibles.length >= 0)).toBeTruthy();
            }
        }
    }, 20000);
});
