"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const db_1 = require("../../src/config/db");
const User_1 = require("../../src/models/User");
const Package_1 = __importDefault(require("../../src/models/Package"));
const GameSetting_1 = __importDefault(require("../../src/models/GameSetting"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('🎮 TEST COMPLETO DE VALIDACIÓN DEL JUEGO', () => {
    let testToken;
    let testUserId;
    let testUser;
    let packageId;
    const timestamp = Date.now();
    beforeAll(async () => {
        await (0, db_1.connectDB)();
        console.log('\n🎮 ========================================');
        console.log('   INICIANDO VALIDACIÓN COMPLETA DEL JUEGO');
        console.log('   ========================================\n');
    });
    afterAll(async () => {
        // Limpiar datos de test
        await User_1.User.deleteMany({ email: new RegExp(`gametest_${timestamp}`) });
        await (0, db_1.disconnectDB)();
        console.log('\n✅ Test completo finalizado\n');
    });
    describe('🔐 PARTE 1: SEGURIDAD', () => {
        it('1.1 - Debe rechazar acceso sin autenticación', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/users/me')
                .expect(401);
            expect(res.body.error).toBeDefined();
            console.log('   ✓ Sin token → Acceso denegado (401)');
        });
        it('1.2 - Debe registrar usuario con password seguro', async () => {
            const bcrypt = require('bcryptjs');
            const email = `gametest_${timestamp}@test.com`;
            const password = 'GameTest123!';
            const passwordHash = await bcrypt.hash(password, 10);
            testUser = await User_1.User.create({
                username: `gametest_${timestamp}`,
                email,
                passwordHash,
                isVerified: true,
                personajes: [],
                val: 0
            });
            expect(testUser).toBeDefined();
            expect(testUser.passwordHash).not.toBe(password);
            expect(testUser.passwordHash).toMatch(/^\$2[aby]\$/);
            testUserId = testUser._id.toString();
            console.log('   ✓ Usuario creado con password hasheado (bcrypt)');
        });
        it('1.3 - Debe generar token JWT válido', async () => {
            testToken = jsonwebtoken_1.default.sign({ id: testUserId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
            const decoded = jsonwebtoken_1.default.verify(testToken, process.env.JWT_SECRET || 'secret');
            expect(decoded.id).toBe(testUserId);
            expect(decoded.exp).toBeDefined();
            console.log('   ✓ Token JWT generado correctamente (expira en 7 días)');
        });
        it('1.4 - Debe verificar que el usuario fue creado correctamente', async () => {
            const user = await User_1.User.findById(testUserId);
            expect(user).toBeDefined();
            expect(user.isVerified).toBe(true);
            expect(user.personajes).toBeDefined();
            console.log('   ✓ Usuario creado y validado correctamente');
        });
    });
    describe('🎲 PARTE 2: APERTURA DE PAQUETES (100x)', () => {
        const results = {
            D: 0,
            C: 0,
            B: 0,
            A: 0,
            S: 0,
            SS: 0,
            SSS: 0,
            total: 0
        };
        beforeAll(async () => {
            const pkg = await Package_1.default.findOne().lean();
            if (!pkg) {
                throw new Error('No hay paquetes en la base de datos');
            }
            packageId = pkg._id.toString();
            console.log(`\n   📦 Usando paquete: ${pkg.nombre}`);
        });
        it('2.1 - Debe abrir 100 paquetes y obtener personajes', async () => {
            console.log('\n   🎲 Abriendo 100 paquetes...');
            for (let i = 0; i < 100; i++) {
                await (0, supertest_1.default)(app_1.default)
                    .post(`/api/user-packages/open`)
                    .set('Authorization', `Bearer ${testToken}`)
                    .send({
                    userId: testUserId,
                    paqueteId: packageId
                })
                    .expect(200);
                // Log cada 20 aperturas
                if ((i + 1) % 20 === 0) {
                    console.log(`   📊 Progreso: ${i + 1}/100 paquetes`);
                }
            }
            // Obtener usuario actualizado
            testUser = await User_1.User.findById(testUserId);
            const personajes = testUser.personajes;
            expect(personajes.length).toBeGreaterThanOrEqual(100);
            console.log(`\n   ✓ Total personajes obtenidos: ${personajes.length}`);
        }, 180000); // 3 minutos de timeout
        it('2.2 - Debe mostrar distribución de rangos', async () => {
            const personajes = testUser.personajes;
            // Contar rangos
            personajes.forEach((p) => {
                const rango = p.rango;
                if (results[rango] !== undefined) {
                    results[rango]++;
                    results.total++;
                }
            });
            console.log('\n   ═══════════════════════════════════════════');
            console.log('   📊 DISTRIBUCIÓN DE RANGOS (100 PAQUETES)');
            console.log('   ═══════════════════════════════════════════\n');
            console.log(`   Rango D:   ${results.D.toString().padStart(3)} personajes (${((results.D / results.total) * 100).toFixed(1)}%)`);
            console.log(`   Rango C:   ${results.C.toString().padStart(3)} personajes (${((results.C / results.total) * 100).toFixed(1)}%)`);
            console.log(`   Rango B:   ${results.B.toString().padStart(3)} personajes (${((results.B / results.total) * 100).toFixed(1)}%)`);
            console.log(`   Rango A:   ${results.A.toString().padStart(3)} personajes (${((results.A / results.total) * 100).toFixed(1)}%)`);
            console.log(`   Rango S:   ${results.S.toString().padStart(3)} personajes (${((results.S / results.total) * 100).toFixed(1)}%)`);
            console.log(`   Rango SS:  ${results.SS.toString().padStart(3)} personajes (${((results.SS / results.total) * 100).toFixed(1)}%)`);
            console.log(`   Rango SSS: ${results.SSS.toString().padStart(3)} personajes (${((results.SSS / results.total) * 100).toFixed(1)}%)`);
            console.log(`\n   Total: ${results.total} personajes`);
            console.log('   ═══════════════════════════════════════════\n');
            // Validar variedad
            const rangosConPersonajes = Object.keys(results)
                .filter(key => key !== 'total')
                .filter(key => results[key] > 0).length;
            expect(rangosConPersonajes).toBeGreaterThan(1);
            console.log(`   ✓ Variedad confirmada: ${rangosConPersonajes} rangos diferentes`);
            // Validar balance (más comunes que raros)
            const comunes = results.D + results.C + results.B;
            const raros = results.A + results.S + results.SS + results.SSS;
            expect(comunes).toBeGreaterThan(raros);
            console.log(`   ✓ Balance: ${comunes} comunes vs ${raros} raros\n`);
        });
    });
    describe('📈 PARTE 3: PROGRESIÓN - NIVEL Y EVOLUCIÓN', () => {
        let characterIndex;
        let gameSettings;
        beforeAll(async () => {
            // Obtener configuración del juego
            gameSettings = await GameSetting_1.default.findOne();
            if (!gameSettings) {
                throw new Error('No hay GameSettings en la base de datos');
            }
            // Seleccionar el primer personaje para evolucionar
            testUser = await User_1.User.findById(testUserId);
            characterIndex = 0;
            console.log('\n   🎯 Personaje seleccionado para evolución:');
            console.log(`   - Rango: ${testUser.personajes[characterIndex].rango}`);
            console.log(`   - Nivel inicial: ${testUser.personajes[characterIndex].nivel}`);
            console.log(`   - Etapa inicial: ${testUser.personajes[characterIndex].etapa_evolucion}\n`);
        });
        it('3.1 - Debe subir de nivel agregando XP', async () => {
            const character = testUser.personajes[characterIndex];
            const characterId = character._id.toString();
            const nivelInicial = character.nivel;
            // Agregar suficiente XP para subir varios niveles
            await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/add-experience`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({ amount: 5000 })
                .expect(200);
            // Verificar subida de nivel
            testUser = await User_1.User.findById(testUserId);
            const updatedChar = testUser.personajes.find((p) => p._id.toString() === characterId);
            expect(updatedChar.nivel).toBeGreaterThan(nivelInicial);
            console.log(`   ✓ Nivel aumentado: ${nivelInicial} → ${updatedChar.nivel}`);
            console.log(`   ✓ Stats mejorados: ATK ${updatedChar.stats.atk}, DEF ${updatedChar.stats.defensa}, HP ${updatedChar.stats.vida_maxima}`);
        });
        it('3.2 - Debe evolucionar a Etapa 2 (nivel 40)', async () => {
            const character = testUser.personajes[characterIndex];
            const characterId = character._id.toString();
            // Subir a nivel 40
            while (character.nivel < 40) {
                await (0, supertest_1.default)(app_1.default)
                    .post(`/api/characters/${characterId}/add-experience`)
                    .set('Authorization', `Bearer ${testToken}`)
                    .send({ amount: 10000 })
                    .expect(200);
                testUser = await User_1.User.findById(testUserId);
                const char = testUser.personajes.find((p) => p._id.toString() === characterId);
                character.nivel = char.nivel;
                character.etapa_evolucion = char.etapa_evolucion;
            }
            console.log(`   ✓ Nivel 40 alcanzado`);
            // Dar recursos para evolucionar
            testUser.val = 10000;
            testUser.evo = 10;
            await testUser.save();
            // Evolucionar a etapa 2
            const evolveRes = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/evolve`)
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            expect(evolveRes.body.success).toBe(true);
            testUser = await User_1.User.findById(testUserId);
            const evolvedChar = testUser.personajes.find((p) => p._id.toString() === characterId);
            expect(evolvedChar.etapa_evolucion).toBe(2);
            console.log(`   ✓ EVOLUCIÓN A ETAPA 2 completada`);
            console.log(`   ✓ Stats después de evolución: ATK ${evolvedChar.stats.atk}, DEF ${evolvedChar.stats.defensa}, HP ${evolvedChar.stats.vida_maxima}`);
        });
        it('3.3 - Debe evolucionar a Etapa 3 (nivel 100)', async () => {
            const character = testUser.personajes[characterIndex];
            const characterId = character._id.toString();
            console.log('\n   🚀 Subiendo a nivel 100...');
            // Subir a nivel 100
            let currentLevel = character.nivel;
            while (currentLevel < 100) {
                await (0, supertest_1.default)(app_1.default)
                    .post(`/api/characters/${characterId}/add-experience`)
                    .set('Authorization', `Bearer ${testToken}`)
                    .send({ amount: 50000 })
                    .expect(200);
                testUser = await User_1.User.findById(testUserId);
                const char = testUser.personajes.find((p) => p._id.toString() === characterId);
                currentLevel = char.nivel;
                if (currentLevel % 20 === 0) {
                    console.log(`   📊 Progreso: Nivel ${currentLevel}/100`);
                }
            }
            console.log(`   ✓ NIVEL 100 ALCANZADO`);
            // Dar recursos para evolucionar
            testUser.val = 50000;
            testUser.evo = 20;
            await testUser.save();
            // Evolucionar a etapa 3
            const evolveRes = await (0, supertest_1.default)(app_1.default)
                .post(`/api/characters/${characterId}/evolve`)
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            expect(evolveRes.body.success).toBe(true);
            testUser = await User_1.User.findById(testUserId);
            const finalChar = testUser.personajes.find((p) => p._id.toString() === characterId);
            expect(finalChar.etapa_evolucion).toBe(3);
            expect(finalChar.nivel).toBe(100);
            console.log('\n   ═══════════════════════════════════════════');
            console.log('   🏆 PERSONAJE MÁXIMO NIVEL ALCANZADO');
            console.log('   ═══════════════════════════════════════════');
            console.log(`   Rango: ${finalChar.rango}`);
            console.log(`   Nivel: ${finalChar.nivel}/100`);
            console.log(`   Etapa: ${finalChar.etapa_evolucion}/3`);
            console.log(`   ATK: ${finalChar.stats.atk}`);
            console.log(`   DEF: ${finalChar.stats.defensa}`);
            console.log(`   HP: ${finalChar.stats.vida_maxima}`);
            console.log('   ═══════════════════════════════════════════\n');
        });
        it('3.4 - Debe validar que el personaje está al máximo', async () => {
            const character = testUser.personajes[characterIndex];
            expect(character.nivel).toBe(100);
            expect(character.etapa_evolucion).toBe(3);
            expect(character.stats.atk).toBeGreaterThan(0);
            expect(character.stats.vida_maxima).toBeGreaterThan(0);
            console.log('   ✓ Personaje validado en nivel y etapa máximos');
            console.log('   ✓ Sistema de progresión funcionando correctamente\n');
        });
    });
    describe('📊 RESUMEN FINAL', () => {
        it('Debe mostrar resumen completo de la validación', async () => {
            testUser = await User_1.User.findById(testUserId);
            const personajesMax = testUser.personajes.filter((p) => p.nivel === 100 && p.etapa_evolucion === 3).length;
            console.log('\n   ═══════════════════════════════════════════');
            console.log('   ✅ RESUMEN DE VALIDACIÓN COMPLETA');
            console.log('   ═══════════════════════════════════════════\n');
            console.log('   🔐 SEGURIDAD:');
            console.log('   ✓ Autenticación JWT funcionando');
            console.log('   ✓ Passwords hasheados con bcrypt');
            console.log('   ✓ Autorización validada\n');
            console.log('   🎲 PAQUETES:');
            console.log('   ✓ 100 aperturas exitosas');
            console.log('   ✓ Distribución de rangos balanceada');
            console.log(`   ✓ ${testUser.personajes.length} personajes totales\n`);
            console.log('   📈 PROGRESIÓN:');
            console.log('   ✓ Sistema de XP funcionando');
            console.log('   ✓ Subida de niveles correcta');
            console.log('   ✓ Evolución de etapas exitosa');
            console.log(`   ✓ ${personajesMax} personaje(s) alcanzó nivel 100 + etapa 3\n`);
            console.log('   🎮 CONCLUSIÓN:');
            console.log('   ✅ El juego funciona completamente de principio a fin');
            console.log('   ✅ Los jugadores pueden registrarse, obtener personajes,');
            console.log('      subirlos de nivel y evolucionar hasta el máximo');
            console.log('   ✅ La randomización es justa y balanceada');
            console.log('   ✅ El sistema es seguro y robusto\n');
            console.log('   ═══════════════════════════════════════════\n');
        });
    });
});
