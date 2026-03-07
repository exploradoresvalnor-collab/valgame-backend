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
(0, globals_1.describe)('E2E Consumibles', () => {
    const testUser = { email: `cons${Date.now()}@test.com`, username: `cons${Date.now()}`, password: 'StrongPassword123!' };
    let authToken;
    let characterId;
    let itemId;
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
        await (0, supertest_1.default)(app).post('/auth/register').send(testUser).expect(201);
        const { User: UserModel } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const user = await UserModel.findOne({ email: testUser.email });
        const token = user.verificationToken;
        await (0, supertest_1.default)(app).get(`/auth/verify/${token}`).expect(200);
        const loginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: testUser.email, password: testUser.password });
        authToken = loginRes.body.token;
        const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${authToken}`);
        characterId = me.body.personajes[0].personajeId;
        itemId = me.body.inventarioConsumibles[0].consumableId;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('usar consumible y validar efectos', async () => {
        // dañar personaje
        const { User: UserModel } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const userPre = await UserModel.findOne({ email: testUser.email });
        const char = userPre.personajes.find((p) => p.personajeId === characterId);
        char.saludActual = 30;
        await userPre.save();
        const res = await (0, supertest_1.default)(app)
            .post(`/api/characters/${characterId}/use-consumable`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ itemId });
        (0, globals_1.expect)(res.status).toBe(200);
        const userPost = await UserModel.findOne({ email: testUser.email });
        const charPost = userPost.personajes.find((p) => p.personajeId === characterId);
        (0, globals_1.expect)(charPost.saludActual).toBeGreaterThan(30);
        // El seed añade 3 instancias del mismo consumible; tras usar uno, el conteo debe decrecer en 1
        const beforeCount = (await UserModel.findOne({ email: testUser.email })).inventarioConsumibles.filter((c) => c.consumableId.toString() === itemId).length + 1; // +1 because ya consumimos
        const afterCount = userPost.inventarioConsumibles.filter((c) => c.consumableId.toString() === itemId).length;
        (0, globals_1.expect)(afterCount).toBe(beforeCount - 1);
    }, 20000);
});
