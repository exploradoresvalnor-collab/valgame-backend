import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import { User } from '../../src/models/User';
import PackageModel from '../../src/models/Package';

describe('🎲 TEST DE PROBABILIDADES - 100 APERTURAS DE PAQUETES', () => {
  let testUser: any;
  let testToken: string;
  let packageId: string;
  const timestamp = Date.now();

  beforeAll(async () => {
    await connectDB();
    console.log('\n🎲 Iniciando TEST DE PROBABILIDADES (100 aperturas)...\n');

    // Registrar usuario de prueba
    const email = `prob_${timestamp}@test.com`;
    const password = 'TestProb123!';

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: `prob_user_${timestamp}`,
        email,
        password,
      });

    console.log(`   📝 Registro: ${registerRes.status} - ${registerRes.body.message || registerRes.body.error || 'OK'}`);

    // Buscar el usuario y verificar (crear si no existe)
    testUser = await User.findOne({ email });
    if (!testUser) {
      // Si no se pudo registrar, crear directamente
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 10);
      testUser = await User.create({
        username: `prob_user_${timestamp}`,
        email,
        passwordHash,
        isVerified: true,
        personajes: []
      });
      console.log('   ✓ Usuario creado directamente en BD');
    } else {
      testUser.isVerified = true;
      await testUser.save();
      console.log('   ✓ Usuario encontrado y verificado');
    }

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    testToken = loginRes.body.token;

    // Obtener paquete
    const pkg = await PackageModel.findOne().lean();
    if (!pkg) {
      throw new Error('No hay paquetes en la base de datos');
    }
    packageId = pkg._id.toString();

    console.log(`   📦 Paquete seleccionado: ${pkg.nombre}`);
    console.log(`   👤 Usuario de prueba: ${testUser.username}`);
    console.log(`   🎯 Objetivo: 100 aperturas\n`);
  });

  afterAll(async () => {
    await User.deleteMany({ email: new RegExp(`prob_${timestamp}`) });
    await disconnectDB();
    console.log('\n✅ Test de probabilidades finalizado\n');
  });

  it('Debe abrir 100 paquetes y mostrar distribución de rangos', async () => {
    const results = {
      D: 0,
      C: 0,
      B: 0,
      A: 0,
      S: 0,
      SS: 0,
      SSS: 0,
      total: 0,
      characters: [] as any[]
    };

    console.log('   🎲 Abriendo 100 paquetes...\n');

    // Abrir 100 paquetes
    for (let i = 0; i < 100; i++) {
      try {
        const res = await request(app)
          .post(`/api/user-packages/open`)
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            userId: testUser._id.toString(),
            paqueteId: packageId
          });

        if (res.status === 200 && res.body.ok) {
          // Obtener el personaje recién agregado
          const updatedUser = await User.findById(testUser._id);
          if (updatedUser && updatedUser.personajes.length > results.total) {
            const lastCharacter = updatedUser.personajes[updatedUser.personajes.length - 1];
            const rango = lastCharacter.rango;
            
            results[rango as keyof typeof results]++;
            results.total++;
            results.characters.push(lastCharacter);
          }
        }

        // Log progreso cada 25 aperturas
        if ((i + 1) % 25 === 0) {
          console.log(`   📊 Progreso: ${i + 1}/100 paquetes abiertos`);
        }
      } catch (error) {
        console.error(`   ❌ Error en apertura ${i + 1}:`, error);
      }
    }

    console.log('\n   ═══════════════════════════════════════════');
    console.log('   📊 RESULTADOS DE 100 APERTURAS DE PAQUETES');
    console.log('   ═══════════════════════════════════════════\n');

    // Mostrar distribución
    console.log('   📈 Distribución de Rangos:');
    console.log(`   - Rango D:   ${results.D.toString().padStart(3)} (${(results.D / results.total * 100).toFixed(1)}%)`);
    console.log(`   - Rango C:   ${results.C.toString().padStart(3)} (${(results.C / results.total * 100).toFixed(1)}%)`);
    console.log(`   - Rango B:   ${results.B.toString().padStart(3)} (${(results.B / results.total * 100).toFixed(1)}%)`);
    console.log(`   - Rango A:   ${results.A.toString().padStart(3)} (${(results.A / results.total * 100).toFixed(1)}%)`);
    console.log(`   - Rango S:   ${results.S.toString().padStart(3)} (${(results.S / results.total * 100).toFixed(1)}%)`);
    console.log(`   - Rango SS:  ${results.SS.toString().padStart(3)} (${(results.SS / results.total * 100).toFixed(1)}%)`);
    console.log(`   - Rango SSS: ${results.SSS.toString().padStart(3)} (${(results.SSS / results.total * 100).toFixed(1)}%)`);
    console.log(`\n   Total de personajes obtenidos: ${results.total}`);

    // Validaciones
    expect(results.total).toBeGreaterThan(0);
    
    // Validar que hay variedad
    const rangosConPersonajes = Object.keys(results)
      .filter(key => key !== 'total' && key !== 'characters')
      .filter(key => (results[key as keyof typeof results] as number) > 0).length;
    
    expect(rangosConPersonajes).toBeGreaterThan(1);
    console.log(`\n   ✓ Variedad confirmada: ${rangosConPersonajes} rangos diferentes obtenidos`);

    // Validar balance común vs raro
    const comunes = results.D + results.C + results.B;
    const raros = results.A + results.S + results.SS + results.SSS;
    
    console.log(`\n   📊 Distribución por rareza:`);
    console.log(`   - Comunes (D/C/B): ${comunes} (${(comunes / results.total * 100).toFixed(1)}%)`);
    console.log(`   - Raros (A/S/SS/SSS): ${raros} (${(raros / results.total * 100).toFixed(1)}%)`);

    if (results.total >= 50) {
      // Solo validar balance si obtuvimos suficientes personajes
      expect(comunes).toBeGreaterThan(raros);
      console.log(`\n   ✓ Balance confirmado: Más personajes comunes que raros`);
    }

    // Validar que cada personaje tiene datos válidos
    const sampleSize = Math.min(10, results.characters.length);
    for (let i = 0; i < sampleSize; i++) {
      const char = results.characters[i];
      expect(char.rango).toMatch(/^(D|C|B|A|S|SS|SSS)$/);
      expect(char.nivel).toBeGreaterThan(0);
      expect(char.stats).toBeDefined();
    }

    console.log(`   ✓ Muestra de ${sampleSize} personajes validada - todos tienen datos correctos`);
    console.log('\n   ═══════════════════════════════════════════');
    console.log('   ✅ TEST DE PROBABILIDADES COMPLETADO');
    console.log('   ═══════════════════════════════════════════\n');
  });
});
