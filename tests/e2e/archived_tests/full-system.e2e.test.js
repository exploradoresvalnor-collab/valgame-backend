"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const app_1 = __importDefault(require("../../src/app"));
const setup_1 = require("./setup");
const User_1 = require("../../src/models/User");
const BaseCharacter_1 = __importDefault(require("../../src/models/BaseCharacter"));
let mongod;
(0, globals_1.describe)('Sistema Completo E2E', () => {
    let authToken;
    let characterId;
    let itemId = '';
    let listingId;
    const testUser = {
        email: `test${Date.now()}@test.com`,
        username: `testuser${Date.now()}`,
        password: 'test1234'
    };
    (0, globals_1.beforeAll)(async () => {
        mongod = await (0, setup_1.setupTestDB)();
        await (0, setup_1.seedTestData)();
    });
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)(mongod);
    });
    (0, globals_1.describe)('1. Sistema de Onboarding y Autenticación', () => {
        (0, globals_1.it)('debería registrar un nuevo usuario', async () => {
            const res = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(testUser);
            (0, globals_1.expect)(res.status).toBe(201);
        });
        (0, globals_1.it)('debería verificar la cuenta, recibir el paquete, iniciar sesión y obtener un token', async () => {
            const user = await User_1.User.findOne({ email: testUser.email });
            (0, globals_1.expect)(user).toBeDefined();
            const token = user?.verificationToken;
            (0, globals_1.expect)(token).toBeDefined();
            const verifyRes = await (0, supertest_1.default)(app_1.default).get(`/auth/verify/${token}`);
            (0, globals_1.expect)(verifyRes.status).toBe(200);
            (0, globals_1.expect)(verifyRes.body.package.delivered).toBe(true);
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            (0, globals_1.expect)(loginRes.status).toBe(200);
            (0, globals_1.expect)(loginRes.body.token).toBeDefined();
            authToken = loginRes.body.token;
        });
        (0, globals_1.it)('debería obtener el inventario y personaje iniciales correctamente', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${authToken}`);
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.inventarioConsumibles).toBeDefined();
            (0, globals_1.expect)(res.body.personajes).toBeDefined();
            (0, globals_1.expect)(res.body.personajes).toHaveLength(1);
            (0, globals_1.expect)(res.body.inventarioConsumibles.length).toBeGreaterThan(0); // Asegurarse de que hay al menos un ítem
            characterId = res.body.personajes[0].personajeId;
            itemId = res.body.inventarioConsumibles[0].consumableId;
            (0, globals_1.expect)(characterId).toBeDefined();
            (0, globals_1.expect)(itemId).toBeDefined();
        });
    });
    (0, globals_1.describe)('2. Sistema de Marketplace', () => {
        (0, globals_1.it)('debería crear un listing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/marketplace/listings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ itemId: itemId, precio: 100, cantidad: 1 });
            (0, globals_1.expect)(res.status).toBe(201);
            listingId = res.body.listing.id;
            // Validación: El item ya no debe estar en el inventario del usuario
            const user = await User_1.User.findOne({ email: testUser.email });
            const itemInInventory = user.inventarioConsumibles.some(c => c.consumableId.toString() === itemId);
            (0, globals_1.expect)(itemInInventory).toBe(false);
        });
        (0, globals_1.it)('debería buscar listings', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/marketplace/listings')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ type: 'consumible', precioMax: 200 });
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(Array.isArray(res.body.listings)).toBe(true);
            (0, globals_1.expect)(res.body.listings.length).toBeGreaterThan(0);
        });
        (0, globals_1.it)('debería fallar al intentar comprar su propio item', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/marketplace/listings/${listingId}/buy`)
                .set('Authorization', `Bearer ${authToken}`);
            (0, globals_1.expect)(res.status).toBe(400);
        });
        (0, globals_1.it)('debería cancelar el listing para recuperar el item', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/marketplace/listings/${listingId}`)
                .set('Authorization', `Bearer ${authToken}`);
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.message).toMatch(/Listado cancelado exitosamente/);
            // Validación: El item debe haber vuelto al inventario del usuario
            const user = await User_1.User.findOne({ email: testUser.email });
            const itemInInventory = user.inventarioConsumibles.some(c => c.consumableId.toString() === itemId);
            (0, globals_1.expect)(itemInInventory).toBe(true);
        });
    });
    (0, globals_1.describe)('3. Sistema de Items', () => {
        (0, globals_1.it)('debería usar un consumible', async () => {
            // Precondición: Dañar al personaje para que la poción tenga efecto
            const userPre = await User_1.User.findOne({ email: testUser.email });
            const charPre = userPre.personajes.find(p => p.personajeId === characterId);
            charPre.saludActual = 50;
            await userPre.save();
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/use-consumable`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ itemId: itemId });
            (0, globals_1.expect)(res.status).toBe(200);
            // Validación: Verificar que la salud del personaje aumentó y el item se consumió
            const userPost = await User_1.User.findOne({ email: testUser.email });
            const charPost = userPost.personajes.find(p => p.personajeId === characterId);
            (0, globals_1.expect)(charPost.saludActual).toBe(100); // 50 (daño) + 50 (poción)
            (0, globals_1.expect)(userPost.inventarioConsumibles.some(c => c.consumableId.toString() === itemId)).toBe(false);
        });
    });
    (0, globals_1.describe)('4. Mecánicas de Supervivencia', () => {
        (0, globals_1.it)('debería curar un personaje', async () => {
            // Precondición: Dañar al personaje primero
            const user = await User_1.User.findOne({ email: testUser.email });
            const character = user.personajes.find(p => p.personajeId === characterId);
            character.saludActual = 50;
            await user.save();
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/heal`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ amount: 10 });
            (0, globals_1.expect)(res.status).toBe(200);
            // Validación: Verificar que la salud del personaje está al máximo
            const userPost = await User_1.User.findOne({ email: testUser.email });
            const charPost = userPost.personajes.find(p => p.personajeId === characterId);
            (0, globals_1.expect)(charPost.saludActual).toBe(charPost.saludMaxima);
        });
        (0, globals_1.it)('debería revivir un personaje', async () => {
            // Precondición: Poner al personaje en estado 'herido' y asegurar fondos
            const user = await User_1.User.findOne({ email: testUser.email });
            const valAntes = 500;
            const character = user.personajes.find(p => p.personajeId === characterId);
            character.estado = 'herido';
            user.val = valAntes; // Asegurar que hay suficiente VAL para revivir
            await user.save();
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/revive`)
                .set('Authorization', `Bearer ${authToken}`);
            (0, globals_1.expect)(res.status).toBe(200); // Asumiendo que el costo de revivir es 50
            // Validación: Verificar que el estado del personaje es 'saludable' y se cobró el VAL
            const userPost = await User_1.User.findOne({ email: testUser.email });
            const charPost = userPost.personajes.find(p => p.personajeId === characterId);
            (0, globals_1.expect)(charPost.estado).toBe('saludable');
            (0, globals_1.expect)(userPost.val).toBeLessThan(valAntes);
        });
    });
    (0, globals_1.describe)('5. Rate Limiting', () => {
        (0, globals_1.it)('debería bloquear después de muchos intentos de login fallidos', async () => {
            const nonExistentEmail = `nouser${Date.now()}@test.com`;
            // Para garantizar que el rate-limiter esté activo durante este test,
            // recargamos la instancia de la app con la variable de entorno habilitando el limiter.
            const originalFlag = process.env.TEST_ENABLE_RATE_LIMIT;
            process.env.TEST_ENABLE_RATE_LIMIT = 'true';
            // Forzar recarga del módulo app para que el middleware lea la nueva variable
            delete require.cache[require.resolve('../../src/app')];
            const reloadedApp = require('../../src/app').default || require('../../src/app');
            for (let i = 0; i <= 5; i++) {
                const res = await (0, supertest_1.default)(reloadedApp)
                    .post('/auth/login')
                    .send({ email: nonExistentEmail, password: 'wrongpass' });
                if (i === 5) {
                    (0, globals_1.expect)(res.status).toBe(429);
                }
            }
            // Restaurar flag original
            process.env.TEST_ENABLE_RATE_LIMIT = originalFlag;
        }, 10000);
    });
    (0, globals_1.describe)('6. Sistema de Evolución', () => {
        (0, globals_1.it)('debería evolucionar un personaje', async () => {
            // Precondición: Añadir una evolución al personaje base y cumplir los requisitos
            const baseChar = await BaseCharacter_1.default.findOne({ id: 'base_d_001' });
            if (baseChar) {
                baseChar.evoluciones = [{
                        nombre: 'Explorador Veterano',
                        etapa: 2,
                        requisitos: { nivel: 10, val: 100, evo: 100 },
                        stats: { atk: 10, vida: 120, defensa: 5 },
                        multiplicador_base: 1.2,
                        val_por_nivel_por_etapa: [1.2]
                    }];
                await baseChar.save();
            }
            const user = await User_1.User.findOne({ email: testUser.email });
            const character = user.personajes.find(p => p.personajeId === characterId);
            character.nivel = 10; // Nivel requerido
            user.val = 200; // Recursos suficientes
            user.evo = 200; // Recursos suficientes
            await user.save();
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/evolve`)
                .set('Authorization', `Bearer ${authToken}`);
            (0, globals_1.expect)(res.status).toBe(200);
            // Validación: Verificar que la etapa del personaje ha aumentado
            const userPost = await User_1.User.findOne({ email: testUser.email });
            const charPost = userPost.personajes.find(p => p.personajeId === characterId);
            (0, globals_1.expect)(charPost.etapa).toBe(2);
        });
    });
});
