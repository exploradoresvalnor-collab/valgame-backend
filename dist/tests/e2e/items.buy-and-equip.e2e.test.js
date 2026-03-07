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
const mongoose_1 = require("mongoose");
let mongod;
let app;
globals_1.jest.setTimeout(30000);
(0, globals_1.describe)('E2E Items buy + equip', () => {
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
        app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.it)('should buy an equipment and equip it to a character', async () => {
        // register + verify + login
        const email = `buyandequip${Date.now()}@test.com`;
        await (0, supertest_1.default)(app).post('/auth/register').send({ email, username: email, password: 'StrongPass1!' }).expect(201);
        const { User } = await Promise.resolve().then(() => __importStar(require('../../src/models/User')));
        const user = await User.findOne({ email });
        await (0, supertest_1.default)(app).get(`/auth/verify/${user.verificationToken}`).expect(200);
        const login = await (0, supertest_1.default)(app).post('/auth/login').send({ email, password: 'StrongPass1!' }).expect(200);
        const token = login.body.token;
        // Create equipment for sale
        const { Equipment } = await Promise.resolve().then(() => __importStar(require('../../src/models/Equipment')));
        const equipment = await Equipment.create({
            _id: new mongoose_1.Types.ObjectId(),
            nombre: 'Espada de Test',
            descripcion: 'Para testing',
            rango: 'D',
            tipo: 'arma',
            nivel_minimo_requerido: 1,
            stats: { atk: 5, defensa: 1, vida: 0 },
            costo_val: 25,
            fuentes_obtencion: ['tienda']
        });
        // Fund user
        user.val = 100;
        // Add a character to the user to equip
        user.personajes.push({
            personajeId: 'test_char_1',
            rango: 'D',
            nivel: 1,
            etapa: 1,
            progreso: 0,
            experiencia: 0,
            stats: { atk: 10, vida: 50, defensa: 5 },
            saludActual: 50,
            saludMaxima: 50,
            estado: 'saludable',
            fechaHerido: null,
            equipamiento: [],
            activeBuffs: []
        });
        await user.save();
        // Buy equipment
        const res = await (0, supertest_1.default)(app)
            .post(`/api/items/${equipment._id}/buy`)
            .set('Authorization', `Bearer ${token}`)
            .send({ cantidad: 1, currency: 'val' })
            .expect(200);
        (0, globals_1.expect)(res.body.ok).toBe(true);
        const refreshed = await User.findById(user._id);
        (0, globals_1.expect)(refreshed?.val).toBe(75); // 100 - 25
        (0, globals_1.expect)(refreshed?.inventarioEquipamiento.some((id) => String(id) === String(equipment._id))).toBe(true);
        // Equip the item
        const equipRes = await (0, supertest_1.default)(app)
            .post(`/api/characters/test_char_1/equip`)
            .set('Authorization', `Bearer ${token}`)
            .send({ itemId: equipment._id })
            .expect(200);
        (0, globals_1.expect)(equipRes.body.message).toMatch(/ha sido equipado/);
        (0, globals_1.expect)(equipRes.body.character.equipamiento.some((id) => String(id) === String(equipment._id))).toBe(true);
    });
});
