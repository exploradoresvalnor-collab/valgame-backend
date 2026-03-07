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
const setup_1 = require("./setup");
let mongod;
let app;
const testEmail = `e2e_test_${Date.now()}@example.com`;
const testUser = { email: testEmail, username: `e2e_${Date.now()}`, password: 'StrongPassword123!' };
describe('Auth E2E', () => {
    beforeAll(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
    });
    it('should register, login and get health', async () => {
        const registerRes = await (0, supertest_1.default)(app).post('/auth/register').send(testUser).expect(201);
        expect(registerRes.body.message).toMatch(/Registro exitoso/);
        // Verificar el usuario manualmente para poder hacer login
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const user = await User.findOne({ email: testUser.email });
        if (user) {
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
        }
        const loginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: testUser.email, password: testUser.password }).expect(200);
        expect(loginRes.body.token).toBeTruthy();
        const healthRes = await (0, supertest_1.default)(app).get('/health').expect(200);
        expect(healthRes.body.ok).toBe(true);
    }, 20000);
    afterAll(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
});
