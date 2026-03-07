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
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const setup_1 = require("./setup");
const LevelHistory_1 = require("../../src/models/LevelHistory");
const User_1 = require("../../src/models/User");
let mongod;
let token;
let userId;
let characterId;
beforeAll(async () => {
    mongod = await (0, setup_1.setupTestDB)();
    await (0, setup_1.seedTestData)();
});
afterAll(async () => {
    await (0, setup_1.cleanupTestDB)(mongod);
});
describe('Sistema de Niveles', () => {
    beforeEach(async () => {
        // Limpiar TODAS las colecciones antes de cada test
        await User_1.User.deleteMany({});
        await LevelHistory_1.LevelHistory.deleteMany({});
        // Limpiar también las colecciones que se crean en seedTestData
        const { Item } = await Promise.resolve().then(() => __importStar(require('../../src/models/Item')));
        const { Consumable } = await Promise.resolve().then(() => __importStar(require('../../src/models/Consumable')));
        const BaseCharacter = (await Promise.resolve().then(() => __importStar(require('../../src/models/BaseCharacter')))).default;
        const Package = (await Promise.resolve().then(() => __importStar(require('../../src/models/Package')))).default;
        const GameSetting = (await Promise.resolve().then(() => __importStar(require('../../src/models/GameSetting')))).default;
        const LevelRequirement = (await Promise.resolve().then(() => __importStar(require('../../src/models/LevelRequirement')))).default;
        await Item.deleteMany({});
        await Consumable.deleteMany({});
        await BaseCharacter.deleteMany({});
        await Package.deleteMany({});
        await GameSetting.deleteMany({});
        await LevelRequirement.deleteMany({});
        // Ahora sembrar los datos de prueba
        await (0, setup_1.seedTestData)();
        // Crear un usuario de prueba y su personaje inicial
        const userResponse = await (0, supertest_1.default)(app_1.default)
            .post('/auth/register')
            .send({
            email: 'test@test.com',
            password: 'StrongPassword123!',
            username: 'testUser'
        });
        // Verificar que el registro fue exitoso
        if (userResponse.status !== 201) {
            console.error('Error en registro:', userResponse.body);
            throw new Error(`Registro falló: ${JSON.stringify(userResponse.body)}`);
        }
        // Buscar el usuario recién creado y verificarlo manualmente (bypass para testing)
        let user = await User_1.User.findOne({ email: 'test@test.com' });
        if (!user) {
            throw new Error('Usuario no encontrado después del registro');
        }
        // Verificar el usuario y entregar el paquete del pionero manualmente
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        // Entregar el Paquete del Pionero manualmente para testing
        const { deliverPioneerPackage } = await Promise.resolve().then(() => __importStar(require('../../src/services/onboarding.service')));
        await deliverPioneerPackage(user);
        await user.save();
        userId = user._id.toString();
        // Ahora hacer login para obtener el token
        const loginResponse = await (0, supertest_1.default)(app_1.default)
            .post('/auth/login')
            .send({
            email: 'test@test.com',
            password: 'StrongPassword123!'
        });
        if (loginResponse.status !== 200 || !loginResponse.body.token) {
            console.error('Error en login:', loginResponse.body);
            throw new Error(`Login falló: ${JSON.stringify(loginResponse.body)}`);
        }
        token = loginResponse.body.token;
        // Obtener y actualizar el usuario con todas las propiedades necesarias
        user = await User_1.User.findById(userId);
        if (user && user.personajes.length > 0) {
            const personaje = user.personajes[0];
            personaje.rango = 'D';
            personaje.nivel = 1;
            personaje.etapa = 1;
            personaje.progreso = 0;
            personaje.experiencia = 0;
            personaje.stats = {
                atk: 10,
                defensa: 10,
                vida: 100
            };
            personaje.saludActual = 100;
            personaje.saludMaxima = 100;
            await user.save();
            characterId = personaje.personajeId;
        }
        else {
            throw new Error('No se pudo crear el personaje inicial');
        }
    });
    it('debería registrar el historial cuando un personaje sube de nivel', async () => {
        // Simular una subida de nivel (200 EXP para nivel 2 según LevelRequirement)
        const response = await (0, supertest_1.default)(app_1.default)
            .post(`/api/characters/${characterId}/add-experience`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 200 }); // 200 EXP es suficiente para subir al nivel 2
        expect(response.status).toBe(200);
        // Verificar que se creó el registro en level_histories
        const historyEntries = await LevelHistory_1.LevelHistory.find({ userId, personajeId: characterId });
        expect(historyEntries).toHaveLength(1);
        expect(historyEntries[0]).toMatchObject({
            userId: expect.any(mongoose_1.default.Types.ObjectId),
            personajeId: characterId,
            nivel: 2,
            experienciaTotal: expect.any(Number),
            experienciaAnterior: expect.any(Number),
            experienciaNueva: expect.any(Number),
            statsAnteriores: {
                atk: expect.any(Number),
                defensa: expect.any(Number),
                vida: expect.any(Number)
            },
            statsNuevos: {
                atk: expect.any(Number),
                defensa: expect.any(Number),
                vida: expect.any(Number)
            },
            fecha: expect.any(Date)
        });
        // Verificar que el personaje actualizó su nivel
        const updatedUser = await User_1.User.findById(userId);
        const character = updatedUser?.personajes.find(p => p.personajeId === characterId);
        expect(character?.nivel).toBe(2);
    });
    it('debería mantener un historial completo de subidas de nivel', async () => {
        // Simular múltiples subidas de nivel
        for (let i = 0; i < 3; i++) {
            const response = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/add-experience`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 150 }); // Asumiendo que cada 150 EXP sube un nivel
            expect(response.status).toBe(200);
        }
        // Verificar el historial completo
        const historyEntries = await LevelHistory_1.LevelHistory.find({
            userId,
            personajeId: characterId
        }).sort({ fecha: 1 });
        expect(historyEntries).toHaveLength(3);
        expect(historyEntries.map(entry => entry.nivel)).toEqual([2, 3, 4]);
    });
});
