"use strict";
/**
 * TEST E2E CON DATOS REALES DE MONGODB
 *
 * Este test usa los datos REALES que existen en la base de datos:
 * - Paquetes reales (Paquete Pionero, Paquete de Prueba)
 * - Personajes base reales de la colección base_characters
 * - Items reales de las colecciones equipamiento y consumibles
 *
 * NO inventa datos, solo usa lo que YA existe en MongoDB
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("../../src/app"));
const User_1 = require("../../src/models/User");
const Package_1 = __importDefault(require("../../src/models/Package"));
const BaseCharacter_1 = __importDefault(require("../../src/models/BaseCharacter"));
const Consumable_1 = require("../../src/models/Consumable");
const Equipment_1 = require("../../src/models/Equipment");
const Category_1 = __importDefault(require("../../src/models/Category"));
const Dungeon_1 = __importDefault(require("../../src/models/Dungeon"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
describe('🎮 Validación con Datos Reales de MongoDB', () => {
    let testUserId;
    let testToken;
    let realPackages; // Usar any para evitar problemas con lean()
    let realBaseCharacters; // Usar any para evitar problemas con lean()
    let realConsumables;
    let realEquipment;
    let realCategories;
    let realDungeons;
    beforeAll(async () => {
        await mongoose_1.default.connect(process.env.MONGODB_URI || '');
        // OBTENER DATOS REALES DE LA BASE DE DATOS - TODO
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 CARGANDO TODOS LOS DATOS REALES DE MONGODB');
        console.log('═══════════════════════════════════════════════════════════════\n');
        realPackages = await Package_1.default.find().lean();
        console.log(`✅ ${realPackages.length} paquetes reales cargados:`);
        realPackages.forEach(pkg => {
            console.log(`   - ${pkg.nombre} (${pkg.precio_usdt} USDT, ${pkg.personajes} personajes)`);
            if (pkg.categorias_garantizadas && pkg.categorias_garantizadas.length > 0) {
                console.log(`     Categorías garantizadas: ${pkg.categorias_garantizadas.join(', ')}`);
            }
            if (pkg.val_reward) {
                console.log(`     Recompensa VAL: ${pkg.val_reward}`);
            }
        });
        realBaseCharacters = await BaseCharacter_1.default.find().lean();
        console.log(`\n✅ ${realBaseCharacters.length} personajes base reales cargados:`);
        // Agrupar por rango
        const byRank = realBaseCharacters.reduce((acc, char) => {
            const rank = char.descripcion_rango || 'Sin rango';
            acc[rank] = (acc[rank] || 0) + 1;
            return acc;
        }, {});
        Object.entries(byRank).forEach(([rank, count]) => {
            console.log(`   - ${rank}: ${count} personajes`);
        });
        // Mostrar detalles de cada personaje
        console.log('\n📋 DETALLE DE PERSONAJES BASE:');
        realBaseCharacters.forEach((char, index) => {
            console.log(`\n   ${index + 1}. ${char.nombre} (${char.descripcion_rango})`);
            console.log(`      ID: ${char._id}`);
            console.log(`      Stats: ATK=${char.stats.atk}, VIDA=${char.stats.vida}, DEF=${char.stats.defensa}`);
            console.log(`      Nivel: ${char.nivel}, Etapa: ${char.etapa}`);
            console.log(`      Multiplicador base: ${char.multiplicador_base}`);
            if (char.evoluciones && char.evoluciones.length > 0) {
                console.log(`      Evoluciones: ${char.evoluciones.length} etapas`);
            }
        });
        realConsumables = await Consumable_1.Consumable.find().lean();
        console.log(`\n✅ ${realConsumables.length} consumibles reales cargados`);
        realConsumables.forEach(item => {
            console.log(`   - ${item.nombre} (${item.usos_maximos} usos)`);
        });
        realEquipment = await Equipment_1.Equipment.find().lean();
        console.log(`\n✅ ${realEquipment.length} equipamiento real cargado`);
        if (realEquipment.length > 0) {
            realEquipment.forEach(item => {
                console.log(`   - ${item.nombre} (${item.tipo || 'Sin tipo'})`);
            });
        }
        realCategories = await Category_1.default.find().lean();
        console.log(`\n✅ ${realCategories.length} categorías/rangos reales cargados`);
        if (realCategories.length > 0) {
            realCategories.forEach((cat) => {
                console.log(`   - ${cat.nombre}: ${((cat.probabilidad || 0) * 100).toFixed(2)}%`);
            });
        }
        else {
            console.log('   ⚠️ NO HAY CATEGORÍAS - Las probabilidades no están configuradas');
        }
        realDungeons = await Dungeon_1.default.find().lean();
        console.log(`\n✅ ${realDungeons.length} mazmorras reales cargadas`);
        if (realDungeons.length > 0) {
            realDungeons.forEach((dun) => {
                console.log(`   - ${dun.nombre} (HP: ${dun.stats?.vida || 'N/A'})`);
            });
        }
        console.log('\n═══════════════════════════════════════════════════════════════\n');
    });
    afterAll(async () => {
        // Limpiar usuario de prueba
        if (testUserId) {
            await User_1.User.findByIdAndDelete(testUserId);
        }
        await mongoose_1.default.disconnect();
    });
    describe('1️⃣ - Preparación: Crear Usuario de Prueba', () => {
        it('1.1 - Debe crear un usuario de prueba con datos reales', async () => {
            const timestamp = Date.now();
            const password = 'Test1234!';
            // Buscar el PAQUETE PIONERO REAL
            const paquetePionero = realPackages.find(p => p.nombre.toLowerCase().includes('pionero'));
            expect(paquetePionero).toBeDefined();
            console.log(`\n✅ Usando paquete real: ${paquetePionero.nombre}`);
            console.log(`   ID: ${paquetePionero._id}`);
            console.log(`   Precio: ${paquetePionero.precio_usdt} USDT`);
            console.log(`   Personajes: ${paquetePionero.personajes}`);
            // Crear usuario con el modelo correcto
            const testUser = await User_1.User.create({
                username: `realtest_${timestamp}`,
                email: `realtest_${timestamp}@test.com`,
                passwordHash: await bcryptjs_1.default.hash(password, 10),
                isVerified: true,
                receivedPioneerPackage: true,
                personajes: [],
                val: paquetePionero.val_reward || 1000,
                evo: 100,
                boletos: 0,
                invocaciones: 0,
                evoluciones: 0,
                boletosDiarios: 0,
                inventarioEquipamiento: [],
                inventarioConsumibles: [],
                limiteInventarioEquipamiento: 20,
                limiteInventarioConsumibles: 50
            });
            testUserId = testUser._id.toString();
            testToken = `Bearer fake-token-for-${testUserId}`;
            expect(testUser.username).toBe(`realtest_${timestamp}`);
            expect(testUser.val).toBeGreaterThanOrEqual(0);
            console.log(`\n✅ Usuario creado:`);
            console.log(`   Username: ${testUser.username}`);
            console.log(`   VAL: ${testUser.val}`);
            console.log(`   EVO: ${testUser.evo}`);
        });
    });
    describe('2️⃣ - Apertura de Paquetes REALES', () => {
        it('2.1 - Debe abrir el Paquete Pionero REAL 10 veces', async () => {
            const paquetePionero = realPackages.find(p => p.nombre.toLowerCase().includes('pionero'));
            if (!paquetePionero) {
                throw new Error('No se encontró el Paquete Pionero en la base de datos');
            }
            console.log(`\n📦 Abriendo "${paquetePionero.nombre}" 10 veces...\n`);
            const personajesObtenidos = [];
            for (let i = 0; i < 10; i++) {
                const response = await (0, supertest_1.default)(app_1.default)
                    .post(`/api/user-packages/open`)
                    .send({
                    userId: testUserId,
                    paqueteId: paquetePionero._id.toString()
                })
                    .expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.personajes).toBeDefined();
                if (response.body.personajes && response.body.personajes.length > 0) {
                    personajesObtenidos.push(response.body.personajes[0].nombre || 'Personaje sin nombre');
                }
            }
            console.log(`✅ 10 aperturas completadas`);
            console.log(`📊 Personajes obtenidos:`);
            const conteo = personajesObtenidos.reduce((acc, nombre) => {
                acc[nombre] = (acc[nombre] || 0) + 1;
                return acc;
            }, {});
            Object.entries(conteo).forEach(([nombre, cantidad]) => {
                console.log(`   - ${nombre}: ${cantidad} veces`);
            });
            expect(personajesObtenidos.length).toBeGreaterThan(0);
        }, 60000); // 60 segundos timeout
        it('2.2 - Debe validar que los personajes obtenidos existen en base_characters', async () => {
            const user = await User_1.User.findById(testUserId).lean();
            expect(user).toBeDefined();
            expect(user.personajes.length).toBeGreaterThan(0);
            console.log(`\n✅ Usuario tiene ${user.personajes.length} personajes`);
            // Verificar que cada personaje existe en base_characters
            for (const personaje of user.personajes) {
                const baseChar = realBaseCharacters.find(bc => bc._id.toString() === personaje.personajeId.toString());
                expect(baseChar).toBeDefined();
                if (baseChar) {
                    console.log(`   ✓ ${personaje.personajeId} existe en base_characters (${baseChar.nombre})`);
                }
            }
        });
    });
    describe('3️⃣ - Progresión de Nivel con Personaje REAL', () => {
        let characterId;
        it('3.1 - Debe obtener un personaje real del usuario', async () => {
            const user = await User_1.User.findById(testUserId).lean();
            expect(user.personajes.length).toBeGreaterThan(0);
            const firstChar = user.personajes[0];
            characterId = firstChar._id.toString();
            console.log(`\n⚔️ Usando personaje: ${firstChar.nombre} (Nivel ${firstChar.nivel})`);
            expect(firstChar.nivel).toBe(1);
            expect(firstChar.etapa_evolucion).toBe(1);
        });
        it('3.2 - Debe subir al personaje del nivel 1 al nivel 10', async () => {
            console.log(`\n📈 Subiendo nivel 1 → 10...\n`);
            // Añadir suficiente XP para llegar al nivel 10
            const response = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/add-experience`)
                .send({ amount: 10000 }) // XP generosa
                .expect(200);
            expect(response.body.nivel).toBeGreaterThanOrEqual(10);
            console.log(`✅ Personaje ahora está en nivel ${response.body.nivel}`);
        });
        it('3.3 - Debe evolucionar al personaje de etapa 1 a etapa 2', async () => {
            // Primero asegurar que está en nivel 10+
            const userBefore = await User_1.User.findById(testUserId).lean();
            const char = userBefore.personajes.find(p => p._id.toString() === characterId);
            if (char.nivel < 10) {
                await (0, supertest_1.default)(app_1.default)
                    .post(`/api/characters/${characterId}/add-experience`)
                    .send({ amount: 10000 })
                    .expect(200);
            }
            // Intentar evolucionar
            console.log(`\n🔄 Intentando evolución etapa 1 → 2...\n`);
            const response = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/evolve`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.character.etapa_evolucion).toBe(2);
            console.log(`✅ Personaje evolucionado a etapa ${response.body.character.etapa_evolucion}`);
        });
    });
    describe('4️⃣ - Resumen de Validación', () => {
        it('4.1 - Debe mostrar resumen completo con TODOS los datos reales', async () => {
            const user = await User_1.User.findById(testUserId).lean();
            console.log('\n═══════════════════════════════════════════════════════════════');
            console.log('📊 RESUMEN COMPLETO DE VALIDACIÓN CON DATOS REALES');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log(`\n👤 USUARIO:`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Verificado: ${user.isVerified ? 'Sí' : 'No'}`);
            console.log(`   Paquete pionero recibido: ${user.receivedPioneerPackage ? 'Sí' : 'No'}`);
            console.log(`\n💰 RECURSOS:`);
            console.log(`   VAL: ${user.val}`);
            console.log(`   EVO: ${user.evo}`);
            console.log(`   Boletos: ${user.boletos}`);
            console.log(`   Invocaciones realizadas: ${user.invocaciones}`);
            console.log(`   Evoluciones realizadas: ${user.evoluciones}`);
            console.log(`\n⚔️ PERSONAJES (${user.personajes.length}):`);
            user.personajes.forEach((p, i) => {
                console.log(`   ${i + 1}. ${p.personajeId}`);
                console.log(`      Rango: ${p.rango}, Nivel: ${p.nivel}, Etapa: ${p.etapa}`);
                console.log(`      XP: ${p.experiencia}, Progreso: ${p.progreso}`);
                console.log(`      Stats: ATK=${p.stats.atk}, VIDA=${p.stats.vida}, DEF=${p.stats.defensa}`);
                console.log(`      Salud: ${p.saludActual}/${p.saludMaxima} (${p.estado})`);
            });
            console.log(`\n🎒 INVENTARIO:`);
            console.log(`   Equipamiento: ${user.inventarioEquipamiento.length}/${user.limiteInventarioEquipamiento}`);
            console.log(`   Consumibles: ${user.inventarioConsumibles.length}/${user.limiteInventarioConsumibles}`);
            console.log(`\n📦 DATOS REALES UTILIZADOS:`);
            console.log(`   ✅ ${realPackages.length} paquetes disponibles`);
            console.log(`   ✅ ${realBaseCharacters.length} personajes base`);
            console.log(`   ${realCategories.length > 0 ? '✅' : '⚠️'} ${realCategories.length} categorías ${realCategories.length === 0 ? '(SIN CONFIGURAR)' : ''}`);
            console.log(`   ${realEquipment.length > 0 ? '✅' : '⚠️'} ${realEquipment.length} equipamiento ${realEquipment.length === 0 ? '(SIN CREAR)' : ''}`);
            console.log(`   ✅ ${realConsumables.length} consumibles`);
            console.log(`   ${realDungeons.length > 0 ? '✅' : '⚠️'} ${realDungeons.length} mazmorras ${realDungeons.length === 0 ? '(SIN CREAR)' : ''}`);
            console.log(`\n🎯 VALIDACIÓN:`);
            if (realCategories.length === 0) {
                console.log(`   ⚠️ ADVERTENCIA: Sin categorías, las probabilidades no funcionan`);
            }
            if (realEquipment.length === 0) {
                console.log(`   ⚠️ ADVERTENCIA: Sin equipamiento, no se pueden equipar items`);
            }
            if (realDungeons.length === 0) {
                console.log(`   ⚠️ ADVERTENCIA: Sin mazmorras, no se puede hacer combate PvE`);
            }
            if (realCategories.length > 0 && realEquipment.length > 0 && realDungeons.length > 0) {
                console.log(`   ✅ Base de datos completa para gameplay completo`);
            }
            console.log('═══════════════════════════════════════════════════════════════\n');
            expect(user).toBeDefined();
            expect(user.personajes).toBeDefined();
        });
    });
});
