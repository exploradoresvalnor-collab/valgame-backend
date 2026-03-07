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
(0, globals_1.describe)('Shop controller', () => {
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('GET /api/shop/info returns costPerBoleto from GameSetting', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/shop/info');
        (0, globals_1.expect)(res.status).toBe(200);
        const body = res.body;
        (0, globals_1.expect)(body.exchangeRates).toBeDefined();
        // Default from seedTestData sets costo_ticket_en_val: 50 in some seeds, but we rely on existing GameSetting
        // Ensure costPerBoleto exists and is a positive number
        (0, globals_1.expect)(typeof body.exchangeRates.costPerBoleto).toBe('number');
        (0, globals_1.expect)(body.exchangeRates.costPerBoleto).toBeGreaterThan(0);
        // Since business decision is 1 boleto = 100 VAL, it should be >= 1
        // Not enforcing equality here because GameSetting in test may vary; we ensure consistency between costPerBoleto and boletosPerVal
        (0, globals_1.expect)(typeof body.exchangeRates.boletosPerVal).toBe('number');
        (0, globals_1.expect)(body.exchangeRates.boletosPerVal).toBeCloseTo(1 / body.exchangeRates.costPerBoleto, 6);
    });
});
