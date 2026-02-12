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
// Aumentar timeout para tareas de setup que usan MongoMemoryReplSet
jest.setTimeout(120000);
const setup_1 = require("./setup");
let mongod;
let app;
(0, globals_1.describe)('E2E Marketplace History and flows', () => {
    (0, globals_1.beforeAll)(async () => {
        console.log('[TEST] beforeAll start');
        mongod = await (0, setup_1.setupTestDB)();
        console.log('[TEST] setupTestDB done');
        await (0, setup_1.seedTestData)();
        console.log('[TEST] seedTestData done');
        try {
            app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
            console.log('[TEST] app imported');
        }
        catch (err) {
            console.error('[TEST] failed to import app:', err);
            throw err;
        }
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('should list, buy and return history paginated for seller and buyer', async () => {
        // Register seller and buyer
        const seller = { email: `seller${Date.now()}@test.com`, username: `seller${Date.now()}`, password: 'Test1234!A' };
        const buyer = { email: `buyer${Date.now()}@test.com`, username: `buyer${Date.now()}`, password: 'Test1234!B' };
        await (0, supertest_1.default)(app).post('/auth/register').send(seller).expect(201);
        await (0, supertest_1.default)(app).post('/auth/register').send(buyer).expect(201);
        // Verify both accounts via verification endpoint
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const s = await User.findOne({ email: seller.email });
        const b = await User.findOne({ email: buyer.email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${s.verificationToken}`).expect(200);
        await (0, supertest_1.default)(app).get(`/auth/verify/${b.verificationToken}`).expect(200);
        // Login to get tokens
        const loginS = await (0, supertest_1.default)(app).post('/auth/login').send({ email: seller.email, password: seller.password });
        const sellerToken = loginS.body.token;
        const loginB = await (0, supertest_1.default)(app).post('/auth/login').send({ email: buyer.email, password: buyer.password });
        const buyerToken = loginB.body.token;
        // Add an item to seller's inventory directly
        const { Item } = await Promise.resolve().then(() => __importStar(require('../../src/models/Item')));
        const item = await Item.findOne({});
        (0, globals_1.expect)(item).toBeDefined();
        // TS guard
        const itemId = item._id;
        await User.findByIdAndUpdate(s._id, { $push: { inventarioEquipamiento: itemId }, $set: { val: 10000 } });
        await User.findByIdAndUpdate(b._id, { $set: { val: 10000 } });
        // Seller creates listing
        const listRes = await (0, supertest_1.default)(app)
            .post('/api/marketplace/listings')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ itemId: itemId.toString(), precio: 500 });
        if (listRes.status !== 201) {
            console.error('[TEST] listing creation failed, status:', listRes.status, 'body:', listRes.body);
        }
        (0, globals_1.expect)(listRes.status).toBe(201);
        (0, globals_1.expect)(listRes.body.exito).toBeTruthy();
        const listingId = listRes.body.listing.id;
        // Buyer buys the listing
        const buyRes = await (0, supertest_1.default)(app)
            .post(`/api/marketplace/listings/${listingId}/buy`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send()
            .expect(200);
        (0, globals_1.expect)(buyRes.body.exito).toBeTruthy();
        // Seller history
        const sellerHistory = await (0, supertest_1.default)(app)
            .get('/api/marketplace/history?page=0&limit=20')
            .set('Authorization', `Bearer ${sellerToken}`)
            .expect(200);
        (0, globals_1.expect)(sellerHistory.body.success).toBe(true);
        (0, globals_1.expect)(Array.isArray(sellerHistory.body.data)).toBeTruthy();
        (0, globals_1.expect)(sellerHistory.body.pagination).toBeDefined();
        (0, globals_1.expect)(sellerHistory.body.pagination.total).toBeGreaterThanOrEqual(1);
        // Buyer history
        const buyerHistory = await (0, supertest_1.default)(app)
            .get('/api/marketplace/history?page=0&limit=20')
            .set('Authorization', `Bearer ${buyerToken}`)
            .expect(200);
        (0, globals_1.expect)(buyerHistory.body.success).toBe(true);
        (0, globals_1.expect)(Array.isArray(buyerHistory.body.data)).toBeTruthy();
        (0, globals_1.expect)(buyerHistory.body.pagination).toBeDefined();
        (0, globals_1.expect)(buyerHistory.body.pagination.total).toBeGreaterThanOrEqual(1);
    }, 20000);
});
