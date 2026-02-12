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
const setup_1 = require("../e2e/setup");
let mongod;
let app;
(0, globals_1.describe)('Shop - buy boletos', () => {
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('should charge val and add boletos according to GameSetting costo_ticket_en_val', async () => {
        // register user
        const user = { email: `sb${Date.now()}@test.com`, username: `sb${Date.now()}`, password: 'Test1234!A' };
        await (0, supertest_1.default)(app).post('/auth/register').send(user).expect(201);
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const u = await User.findOne({ email: user.email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${u.verificationToken}`).expect(200);
        const loginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = loginRes.body.token;
        // Ensure user has adequate VAL and reset boletos to 0 for purchase
        await User.findByIdAndUpdate(u._id, { $set: { val: 10000, boletos: 0 } });
        // Fetch GameSetting directly to get costPerBoleto (avoids depending on endpoint formatting)
        const GameSetting = (await Promise.resolve().then(() => __importStar(require('../../src/models/GameSetting')))).default;
        const gs = await GameSetting.findOne();
        const costPerBoleto = gs?.costo_ticket_en_val || 100;
        const amount = 2;
        const totalCost = amount * costPerBoleto;
        // Buy boletos
        const res = await (0, supertest_1.default)(app)
            .post('/api/shop/buy-boletos')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount })
            .expect(200);
        (0, globals_1.expect)(res.body.resources).toBeDefined();
        (0, globals_1.expect)(res.body.resources.boletos).toBe(amount);
        const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
        (0, globals_1.expect)(me.body.val).toBe(10000 - totalCost);
        (0, globals_1.expect)(me.body.boletos).toBe(amount);
    });
});
