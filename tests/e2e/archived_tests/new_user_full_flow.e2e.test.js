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
(0, globals_1.describe)('E2E - Nuevo usuario flujo completo (MVP)', () => {
    const user = { email: `new${Date.now()}@test.com`, username: `new${Date.now()}`, password: 'test1234' };
    let token;
    let itemId;
    let listingId;
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('registro, verificacion y login', async () => {
        const reg = await (0, supertest_1.default)(app).post('/auth/register').send(user).expect(201);
        // obtener token de verificacion desde DB
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const u = await User.findOne({ email: user.email });
        (0, globals_1.expect)(u).toBeDefined();
        const verify = await (0, supertest_1.default)(app).get(`/auth/verify/${u.verificationToken}`).expect(200);
        const login = await (0, supertest_1.default)(app).post('/auth/login').send({ email: user.email, password: user.password }).expect(200);
        token = login.body.token;
        (0, globals_1.expect)(token).toBeDefined();
    });
    (0, globals_1.it)('recibe paquete de bienvenida y abre paquete', async () => {
        const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`).expect(200);
        (0, globals_1.expect)(me.body.inventarioConsumibles.length).toBeGreaterThan(0);
        itemId = me.body.inventarioConsumibles[0].consumableId;
        // Obtener un characterId donde aplicar el consumible (fallback si no hay personajes)
        const characterId = (me.body.personajes && me.body.personajes.length)
            ? me.body.personajes[0].personajeId
            : (me.body.personajeActivoId || 'base_d_001');
        // Llamar al endpoint correcto para usar consumible
        const useRes = await (0, supertest_1.default)(app)
            .post(`/api/characters/${characterId}/use-consumable`)
            .set('Authorization', `Bearer ${token}`)
            .send({ itemId })
            .expect(200);
        (0, globals_1.expect)(useRes.body.message).toBeDefined();
    });
    (0, globals_1.it)('publicar listing y verificar búsqueda en marketplace', async () => {
        // publicar item
        const pub = await (0, supertest_1.default)(app)
            .post('/api/marketplace/listings')
            .set('Authorization', `Bearer ${token}`)
            .send({ itemId, precio: 5 })
            .expect(201);
        listingId = pub.body.listing.id || pub.body.listing._id;
        // buscar en marketplace
        const search = await (0, supertest_1.default)(app)
            .get('/api/marketplace/listings')
            .set('Authorization', `Bearer ${token}`)
            .query({ type: 'consumible' })
            .expect(200);
        const found = (search.body.listings || []).some((l) => l._id === listingId || l.id === listingId || l.itemId === itemId);
        (0, globals_1.expect)(found).toBe(true);
    }, 30000);
});
