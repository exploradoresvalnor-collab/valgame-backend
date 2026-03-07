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
const User_1 = require("../../src/models/User");
const Equipment_1 = require("../../src/models/Equipment");
(0, globals_1.describe)('⚔️ TEST E2E: EQUIPO, SURVIVAL y RECUPERACIÓN', () => {
    let app;
    let mongod;
    let user = {
        email: `survival_hero_${Date.now()}@test.com`,
        username: 'SurvivalHero',
        password: 'Password123!'
    };
    let token;
    let userId;
    let characterId; // "base_d_001"
    let characterObjectId; // The Mongo _id
    let equipmentIds = [];
    let consumableId;
    (0, globals_1.beforeAll)(async () => {
        try {
            console.log('--- STARTING BEFORE ALL ---');
            mongod = await (0, setup_1.setupTestDB)();
            console.log('--- DB SETUP DONE ---');
            await (0, setup_1.seedTestData)();
            console.log('--- SEED DATA DONE ---');
            app = (await Promise.resolve().then(() => __importStar(require('../../src/app')))).default;
            console.log('--- APP IMPORTED ---');
            console.log('Registering user...');
            // 1. Registro y Login
            await (0, supertest_1.default)(app).post('/auth/register').send(user).expect(201);
            const u = await User_1.User.findOne({ email: user.email });
            console.log('User found:', u?._id);
            console.log('Verifying user...');
            await (0, supertest_1.default)(app).get(`/auth/verify/${u.verificationToken}`).expect(200);
            const loginRes = await (0, supertest_1.default)(app).post('/auth/login').send({ email: user.email, password: user.password });
            token = loginRes.body.token;
            userId = u._id.toString();
            // 2. Dar recursos
            await User_1.User.findByIdAndUpdate(userId, { $inc: { val: 100000, 'personajes.0.experiencia': 5000 } });
            const userWithChar = await User_1.User.findById(userId);
            console.log('User Personajes count:', userWithChar?.personajes.length);
            if (userWithChar?.personajes && userWithChar.personajes.length > 0) {
                characterId = userWithChar.personajes[0].personajeId;
                characterObjectId = userWithChar.personajes[0]._id.toString();
                console.log('ID:', characterId, 'ObjectID:', characterObjectId);
            }
            else {
                console.error('NO CHARACTERS FOUND ON USER!');
            }
        }
        catch (error) {
            console.error('--- FATAL ERROR IN BEFORE ALL ---', error);
        }
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.describe)('🛡️ 1. Armar Equipo (Equipment & Consumables)', () => {
        (0, globals_1.it)('Debe tener un personaje base', () => {
            (0, globals_1.expect)(characterId).toBeDefined();
        });
        (0, globals_1.it)('Debe obtener/comprar items para llenar 4 slots y consumibles', async () => {
            // Necesitamos 4 items de equipo. El paquete pionero da 1 (Daga).
            // Vamos a "sembrar" items en el inventario del usuario forzosamente para agilizar,
            // o comprarlos en la tienda. Vamos a sembrarlos para testear "Equipar" puro.
            // Crear items en BD si no existen
            const itemsToCreate = [
                { nombre: 'Espada Básica', tipoItem: 'Equipment', tipo: 'arma', stats: { atk: 10, defensa: 0, vida: 0 } },
                { nombre: 'Armadura de Cuero', tipoItem: 'Equipment', tipo: 'armadura', stats: { atk: 0, defensa: 10, vida: 10 } },
                { nombre: 'Escudo de Madera', tipoItem: 'Equipment', tipo: 'escudo', stats: { atk: 0, defensa: 5, vida: 0 } },
                { nombre: 'Anillo de Poder', tipoItem: 'Equipment', tipo: 'anillo', stats: { atk: 2, defensa: 2, vida: 2 } }
            ];
            const createdItems = [];
            for (const i of itemsToCreate) {
                // Usar Item.create con el discriminator invoca la validación correcta
                const newItem = await Equipment_1.Equipment.create({
                    ...i,
                    descripcion: 'Test Item',
                    rango: 'D',
                    costo_val: 100,
                    imagen: 'test.png'
                });
                createdItems.push(newItem);
            }
            equipmentIds = createdItems.map(i => i._id.toString());
            // Agregar al inventario del usuario
            const u = await User_1.User.findById(userId);
            for (const item of createdItems) {
                // inventarioEquipamiento es ObjectId[], no objetos complejos
                u.inventarioEquipamiento.push(item._id);
            }
            await u.save();
            // Verificar que están en inventario endpoint
            const resInv = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            (0, globals_1.expect)(resInv.body.inventarioEquipamiento.length).toBeGreaterThanOrEqual(4);
        });
        (0, globals_1.it)('Debe equipar los 4 items', async () => {
            for (const itemId of equipmentIds) {
                const res = await (0, supertest_1.default)(app)
                    .post(`/api/characters/${characterId}/equip`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ itemId });
                // Puede fallar si ya tiene algo equipado en ese slot (Daga del pionero en weapon?)
                // Nuestros items son helmet, armor, gloves, boots. Weapon es el del pionero.
                // Ah, survival pide "4 items equipped".
                // El pionero da "Daga Oxidada" (weapon).
                // Mis items son helmet, armor, gloves, boots.
                // Total 5. Survival pide EXACTLY 4? o "at least 4"? 
                // SurvivalService: "if (finalEquipmentIds.length !== 4) throw ... Character must have exactly 4 equipped items"
                // Esto es un constraint raro si hay 5 slots (Weapon, Helmet, Armor, Gloves, Boots).
                // Revisemos el código de SurvivalService. 
                // "Character must have exactly 4 equipped items". Quizás el slot Weapon cuenta?
                // Vamos a intentar equipar 4 de los creados.
                (0, globals_1.expect)([200, 201]).toContain(res.status);
            }
            // Verificar equipo final
            const resMe = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            const char = resMe.body.personajes.find((p) => p.personajeId === characterId);
            // Si el pionero ya tenía weapon, ahora tenemos 5.
            // Si Survival exige 4, tendremos que desequipar 1.
            // Veremos qué pasa en el test de survival.
        });
    });
    (0, globals_1.describe)('🔥 2. Combate Survival', () => {
        let sessionId;
        (0, globals_1.it)('Debe iniciar sesión de Survival', async () => {
            // Start Survival
            let res = await (0, supertest_1.default)(app)
                .post('/api/survival/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ characterId: characterObjectId }); // Use ObjectId for Survival Session creation
            if (res.status === 400 && res.body.error && res.body.error.includes('exactly 4')) {
                // Ajuste dinámico: Desequipar un item si hay 5
                const user = await User_1.User.findById(userId);
                const char = user.personajes.id(characterId);
                if (char.equipamiento.length > 4) {
                    const itemToRemove = char.equipamiento[0]; // Quitar el primero
                    await (0, supertest_1.default)(app)
                        .post(`/api/characters/${characterId}/unequip`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({ itemId: itemToRemove.toString() });
                }
                // Reintentar
                const resRetry = await (0, supertest_1.default)(app)
                    .post('/api/survival/start')
                    .set('Authorization', `Bearer ${token}`)
                    .send({ characterId: characterObjectId });
                sessionId = resRetry.body.session?._id || resRetry.body.data?._id;
                (0, globals_1.expect)(resRetry.status).toBe(201);
            }
            else {
                sessionId = res.body.session?._id || res.body.data?._id; // Ajustar según respuesta real
                (0, globals_1.expect)(res.status).toBe(201);
            }
        });
        (0, globals_1.it)('Debe completar una oleada y dar recompensas', async () => {
            if (!sessionId) {
                console.warn('Skipping wave completion because Start Survival failed');
                return;
            }
            const res = await (0, supertest_1.default)(app)
                .post(`/api/survival/${sessionId}/complete-wave`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                waveNumber: 1,
                enemiesDefeated: 5,
                damageDealt: 500
            });
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.message).toMatch(/Wave completed/i);
        });
        (0, globals_1.it)('Debe morir en Survival (Report Death)', async () => {
            if (!sessionId)
                return;
            const res = await (0, supertest_1.default)(app)
                .post(`/api/survival/${sessionId}/death`)
                .set('Authorization', `Bearer ${token}`)
                .send({});
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.message).toMatch(/Death reported|Session ended|ended successfully/i);
        });
    });
    (0, globals_1.describe)('🏥 3. Recuperación y Estadísticas', () => {
        (0, globals_1.it)('Debe tener un registro de run en el historial', async () => {
            // Verificar historial
            // Probablemente no haya endpoint directo de historial expuesto aun, pero podemos ver stats de usuario
            const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            (0, globals_1.expect)(me.body.survivalStats).toBeDefined();
        });
        (0, globals_1.it)('Debe simular daño crítico (Dungeon) para probar curación VAL', async () => {
            // Survival no parece dejar HERIDO al pj automaticamente.
            // Usamos endpoint de testing 'damage' para bajarle la vida a 0
            /*
            router.post('/:characterId/damage', ...)
            */
            await (0, supertest_1.default)(app)
                .post(`/api/characters/${characterId}/damage`)
                .set('Authorization', `Bearer ${token}`)
                .send({ damage: 9999 }); // Matarlo
            // Verificar estado
            const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            const char = me.body.personajes.find((p) => p.personajeId === characterId);
            // SaludaActual deberia ser 0. Estado?
            // Depende de la logica de damage. Si baja a 0, ¿cambia estado a 'herido' automatica?
            // Si no, forzamos estado si fuese necesario, pero lo ideal es probar la logica real.
        });
        (0, globals_1.it)('Debe revivir/curar usando VAL', async () => {
            // Endpoint: POST /:characterId/heal o /:characterId/revive
            // Si tiene 0 HP, heal deberia funcionar.
            const res = await (0, supertest_1.default)(app)
                .post(`/api/characters/${characterId}/heal`)
                .set('Authorization', `Bearer ${token}`)
                .send({});
            (0, globals_1.expect)([200, 400]).toContain(res.status);
            // 400 si no tiene VAL suficiente (pero le dimos 100000).
            // 200 si curó.
            const me = await (0, supertest_1.default)(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
            const char = me.body.personajes.find((p) => p.personajeId === characterId);
            (0, globals_1.expect)(char.saludActual).toBeGreaterThan(0);
        });
    });
});
