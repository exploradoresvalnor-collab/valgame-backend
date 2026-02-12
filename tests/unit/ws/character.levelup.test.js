"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
// Mock auth and validators to simplify
jest.mock('../../../src/middlewares/auth', () => ({
    auth: (req, _res, next) => { req.userId = '507f1f77bcf86cd799439011'; next(); }
}));
jest.mock('../../../src/middlewares/validate', () => ({
    validateBody: () => (_req, _res, next) => next(),
    validateParams: () => (_req, _res, next) => next(),
}));
// Mocks de modelos usados en addExperience
const saveMock = jest.fn().mockResolvedValue(true);
const userMock = {
    _id: '507f1f77bcf86cd799439011',
    personajes: [
        {
            personajeId: 'char-1',
            nivel: 1,
            experiencia: 0,
            stats: { atk: 10, defensa: 5, vida: 100 },
            saludMaxima: 100,
            saludActual: 100,
        }
    ],
    save: saveMock
};
jest.mock('../../../src/models/User', () => ({
    User: { findById: jest.fn().mockResolvedValue(userMock) }
}));
jest.mock('../../../src/models/LevelRequirement', () => ({
    __esModule: true,
    default: { findOne: jest.fn().mockImplementation(({ nivel }) => {
            // exigir 50 exp para nivel 2 y luego no subir más
            if (nivel === 2)
                return Promise.resolve({ experiencia_requerida: 50 });
            return Promise.resolve(null);
        }) }
}));
jest.mock('../../../src/models/BaseCharacter', () => ({
    __esModule: true,
    default: { findOne: jest.fn().mockResolvedValue({ stats: { atk: 10, defensa: 5, vida: 100 } }) }
}));
jest.mock('../../../src/models/LevelHistory', () => ({
    LevelHistory: class {
        constructor(_args) { }
        save() { return Promise.resolve(true); }
    }
}));
// Spy RealtimeService
const notifyCharacterLevelUp = jest.fn();
jest.mock('../../../src/services/realtime.service', () => ({
    RealtimeService: class {
        constructor() {
            this.notifyCharacterUpdate = jest.fn();
            this.notifyCharacterLevelUp = notifyCharacterLevelUp;
        }
        static getInstance() { return new this(); }
    }
}));
// Router de personajes
const characters_routes_1 = __importDefault(require("../../../src/routes/characters.routes"));
describe('character:level-up events', () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/characters', characters_routes_1.default);
    beforeEach(() => {
        notifyCharacterLevelUp.mockClear();
    });
    it('emite character:level-up al superar el umbral de experiencia', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/characters/char-1/add-experience-mock')
            .send({ amount: 60 });
        expect(res.status).toBe(200);
        expect(notifyCharacterLevelUp).toHaveBeenCalledTimes(1);
        const call = notifyCharacterLevelUp.mock.calls[0];
        expect(call[0]).toBe('507f1f77bcf86cd799439011'); // userId
        expect(call[1]).toBe('char-1'); // characterId
        expect(call[2]).toBeGreaterThanOrEqual(2); // new level
        expect(call[3]).toBeGreaterThanOrEqual(1); // levelsGained
    });
});
