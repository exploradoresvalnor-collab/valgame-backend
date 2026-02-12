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
(0, globals_1.describe)('E2E Ranking (skeleton)', () => {
    const userA = { email: `rankA${Date.now()}@test.com`, username: `rankA${Date.now()}`, password: 'StrongPassword123!' };
    const userB = { email: `rankB${Date.now()}@test.com`, username: `rankB${Date.now()}`, password: 'StrongPassword123!' };
    let tokenA;
    let tokenB;
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
        await (0, supertest_1.default)(app).post('/auth/register').send(userA).expect(201);
        await (0, supertest_1.default)(app).post('/auth/register').send(userB).expect(201);
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const a = await User.findOne({ email: userA.email });
        const b = await User.findOne({ email: userB.email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${a.verificationToken}`).expect(200);
        await (0, supertest_1.default)(app).get(`/auth/verify/${b.verificationToken}`).expect(200);
        const la = await (0, supertest_1.default)(app).post('/auth/login').send({ email: userA.email, password: userA.password });
        tokenA = la.body.token;
        const lb = await (0, supertest_1.default)(app).post('/auth/login').send({ email: userB.email, password: userB.password });
        tokenB = lb.body.token;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('simular victoria y comprobar ranking', async () => {
        // TODO: ajustar endpoints para reportar batalla/resultado
        // Intentar obtener ranking
        const ranking = await (0, supertest_1.default)(app).get('/api/ranking').set('Authorization', `Bearer ${tokenA}`);
        (0, globals_1.expect)([200, 404]).toContain(ranking.status);
        // Si existe endpoint para reportar victoria, usarlo; si no, validar que /api/ranking funciona
        if (ranking.status === 200) {
            (0, globals_1.expect)(Array.isArray(ranking.body)).toBe(true);
        }
    }, 20000);
});
