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
(0, globals_1.describe)('E2E Marketplace full flow', () => {
    const seller = { email: `sell${Date.now()}@test.com`, username: `sell${Date.now()}`, password: 'test1234' };
    const buyer = { email: `buy${Date.now()}@test.com`, username: `buy${Date.now()}`, password: 'test1234' };
    let sellerToken;
    let buyerToken;
    let itemId;
    let listingId;
    const price = 10;
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
        // Registrar y verificar seller
        await (0, supertest_1.default)(app).post('/auth/register').send(seller).expect(201);
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const sellerDoc = await User.findOne({ email: seller.email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${sellerDoc.verificationToken}`).expect(200);
        const sellerLoginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: seller.email, password: seller.password });
        (0, globals_1.expect)(sellerLoginRes.status).toBe(200);
        sellerToken = sellerLoginRes.body.token;
        (0, globals_1.expect)(sellerToken).toBeDefined();
        // Registrar y verificar buyer
        await (0, supertest_1.default)(app).post('/auth/register').send(buyer).expect(201);
        const buyerDoc = await User.findOne({ email: buyer.email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${buyerDoc.verificationToken}`).expect(200);
        const buyerLoginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: buyer.email, password: buyer.password });
        (0, globals_1.expect)(buyerLoginRes.status).toBe(200);
        buyerToken = buyerLoginRes.body.token;
        (0, globals_1.expect)(buyerToken).toBeDefined();
        // Obtener item del seller (paquete pionero asignado)
        const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${sellerToken}`);
        itemId = me.body.inventarioConsumibles[0].consumableId;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('publicar listing y verificar desaparición del item del vendedor', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/marketplace/listings')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ itemId, precio: price });
        (0, globals_1.expect)(res.status).toBe(201);
        listingId = res.body.listing.id;
        // verificar vendedor ya no tiene el item
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const sellerPost = await User.findOne({ email: seller.email });
        (0, globals_1.expect)(sellerPost.inventarioConsumibles.some((c) => c.consumableId.toString() === itemId)).toBe(false);
    });
    (0, globals_1.it)('buscar y comprar listing por buyer', async () => {
        const search = await (0, supertest_1.default)(app)
            .get('/api/marketplace/listings')
            .set('Authorization', `Bearer ${buyerToken}`)
            .query({ type: 'consumible' });
        (0, globals_1.expect)(search.status).toBe(200);
        (0, globals_1.expect)(search.body.listings.length).toBeGreaterThan(0);
        // Comprobar que el listing aparezca en los resultados de búsqueda
        const found = (search.body.listings || []).some((l) => {
            return l._id === listingId || l.id === listingId || l.itemId === itemId;
        });
        (0, globals_1.expect)(found).toBe(true);
        // Comprobar saldos antes de la compra (ambos usuarios recibieron 50 VAL en el paquete pionero)
        const UserModel = (await Promise.resolve().then(() => __importStar(require('../../src/models/User')))).User;
        const buyerBefore = await UserModel.findOne({ email: buyer.email });
        const sellerBefore = await UserModel.findOne({ email: seller.email });
        (0, globals_1.expect)(buyerBefore).toBeDefined();
        (0, globals_1.expect)(sellerBefore).toBeDefined();
        (0, globals_1.expect)(typeof buyerBefore.val).toBe('number');
        (0, globals_1.expect)(typeof sellerBefore.val).toBe('number');
        const impuesto = Math.floor(price * 0.05);
        const buyRes = await (0, supertest_1.default)(app)
            .post(`/api/marketplace/listings/${listingId}/buy`)
            .set('Authorization', `Bearer ${buyerToken}`);
        // buyer receives, seller gets val (handled transactionally)
        (0, globals_1.expect)(buyRes.status).toBe(200);
        const buyerPost = await UserModel.findOne({ email: buyer.email });
        const sellerPost = await UserModel.findOne({ email: seller.email });
        // buyer has item
        (0, globals_1.expect)(buyerPost.inventarioConsumibles.some((c) => c.consumableId.toString() === itemId)).toBe(true);
        // seller does not have item
        (0, globals_1.expect)(sellerPost.inventarioConsumibles.some((c) => c.consumableId.toString() === itemId)).toBe(false);
        // Verificar cambios en saldos: buyer -= precio, seller += (precio - impuesto)
        (0, globals_1.expect)(buyerPost.val).toBe(buyerBefore.val - price);
        (0, globals_1.expect)(sellerPost.val).toBe(sellerBefore.val + (price - impuesto));
    }, 30000);
});
