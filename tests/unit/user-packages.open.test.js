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
const app_1 = __importDefault(require("../../src/app"));
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const User_1 = require("../../src/models/User");
const Package_1 = __importDefault(require("../../src/models/Package"));
const UserPackage_1 = __importDefault(require("../../src/models/UserPackage"));
const Category_1 = __importDefault(require("../../src/models/Category"));
const BaseCharacter_1 = __importDefault(require("../../src/models/BaseCharacter"));
const PurchaseLog_1 = __importDefault(require("../../src/models/PurchaseLog"));
describe('POST /api/user-packages/:id/open', () => {
    let mongoServer;
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        // Crear un replSet en memoria para permitir transacciones en los tests
        mongoServer = await MongoMemoryReplSet.create({ replSet: { name: 'rs0', count: 1 } });
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }, 20000);
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        if (mongoServer && typeof mongoServer.stop === 'function') {
            await mongoServer.stop();
        }
    });
    afterEach(async () => {
        await User_1.User.deleteMany({}).exec();
        await Package_1.default.deleteMany({}).exec();
        await UserPackage_1.default.deleteMany({}).exec();
        await Category_1.default.deleteMany({}).exec();
        await BaseCharacter_1.default.deleteMany({}).exec();
        await PurchaseLog_1.default.deleteMany({}).exec();
    });
    it('returns 401 when called without token', async () => {
        // Usar un id aleatorio; la ruta está protegida por auth middleware
        const upId = new mongoose_1.Types.ObjectId().toString();
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/user-packages/${upId}/open`)
            .send();
        expect(res.status).toBe(401);
    });
    it('opens a user package and grants rewards', async () => {
        // Crear category y baseCharacter para la asignación de personajes
        const cat = await Category_1.default.create({ nombre: 'D', probabilidad: 1, descripcion: 'Categoria D', multiplicador_minado: 1 });
        const base = await BaseCharacter_1.default.create({
            id: 'base_1',
            nombre: 'Base1',
            imagen: '/images/base1.png',
            descripcion_rango: 'Personaje comun',
            multiplicador_base: 1,
            nivel: 1,
            etapa: 1,
            val_por_nivel_por_etapa: [0],
            stats: { atk: 5, vida: 100, defensa: 2 },
            progreso: 0,
            evoluciones: []
        });
        // Crear paquete con rewards (campos requeridos según el schema)
        const pkg = await Package_1.default.create({
            nombre: 'Paquete Test',
            tipo: 'starter',
            precio_usdt: 0,
            precio_val: 0,
            personajes: 1,
            categorias_garantizadas: ['D'],
            distribucion_aleatoria: 'uniform',
            val_reward: 5,
            items_reward: []
        });
        // Crear usuario
        const password = 'Password1!';
        const passwordHash = await bcryptjs_1.default.hash(password, 8);
        const user = await User_1.User.create({ email: 'a@b.com', username: 'tester', passwordHash, isVerified: true });
        // Crear UserPackage
        const up = await UserPackage_1.default.create({ userId: user._id.toString(), paqueteId: pkg._id.toString() });
        // Login para obtener token (en test app devuelve token en body)
        const loginRes = await (0, supertest_1.default)(app_1.default).post('/auth/login').send({ email: 'a@b.com', password });
        expect(loginRes.status).toBe(200);
        const token = loginRes.body.token;
        expect(token).toBeDefined();
        // Llamar al endpoint de abrir paquete
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/user-packages/${up._id.toString()}/open`)
            .set('Authorization', `Bearer ${token}`)
            .send();
        expect(res.status).toBe(200);
        expect(res.body.ok).toBeTruthy();
        expect(Array.isArray(res.body.assigned)).toBeTruthy();
        // Verificar que el UserPackage fue eliminado
        const still = await UserPackage_1.default.findById(up._id).exec();
        expect(still).toBeNull();
        // Verificar que PurchaseLog tiene la acción 'open'
        const log = await PurchaseLog_1.default.findOne({ action: 'open', userId: user._id }).exec();
        expect(log).toBeDefined();
    }, 20000);
});
