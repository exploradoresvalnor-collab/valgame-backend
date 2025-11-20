import mongoose from 'mongoose';
import { User } from '../src/models/User';
import EnergyService from '../src/services/energy.service';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valgame';

async function testEnergySystem() {
  console.log('🔋 TESTING ENERGY SYSTEM');
  console.log('========================\n');

  try {
    // Conectar a MongoDB
    console.log('1️⃣ Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado\n');

    // Crear usuario de prueba
    console.log('2️⃣ Creando usuario de prueba...');
    const testUser = await User.create({
      email: `energy_test_${Date.now()}@test.com`,
      username: `energy_test_${Date.now()}`,
      passwordHash: 'hash_fake',
      isVerified: true,
      val: 1000,
      boletos: 10,
      energia: 100,
      energiaMaxima: 100
    });
    console.log(`✅ Usuario creado: ${testUser.username} (ID: ${testUser._id})`);
    console.log(`   Energía inicial: ${testUser.energia}/${testUser.energiaMaxima}\n`);

    // Probar obtener estado de energía
    console.log('3️⃣ Probando regeneración automática...');
    const energyStatus1 = await EnergyService.getEnergyStatus(testUser);
    console.log(`   Estado inicial: ${energyStatus1.energia}/${energyStatus1.energiaMaxima}`);
    console.log(`   Tiempo para regeneración: ${energyStatus1.tiempoParaSiguienteRegeneracion} minutos\n`);

    // Probar consumir energía
    console.log('4️⃣ Probando consumo de energía...');
    const consumeResult = await EnergyService.consumeEnergy(testUser, 30);
    if (consumeResult.success) {
      console.log(`✅ Energía consumida: -30`);
      console.log(`   Energía restante: ${testUser.energia}/${testUser.energiaMaxima}\n`);
    } else {
      console.log(`❌ Error: ${consumeResult.message}\n`);
    }

    // Probar consumir más energía de la disponible
    console.log('5️⃣ Probando consumo excesivo...');
    const consumeResult2 = await EnergyService.consumeEnergy(testUser, 80);
    if (!consumeResult2.success) {
      console.log(`✅ Correctamente rechazado: ${consumeResult2.message}\n`);
    } else {
      console.log(`❌ Error: Debería haber sido rechazado\n`);
    }

    // Simular regeneración cambiando la fecha
    console.log('6️⃣ Simulando regeneración (modificando fecha)...');
    testUser.ultimoReinicioEnergia = new Date(Date.now() - 70 * 60 * 1000); // 70 minutos atrás
    await testUser.save();

    const energyStatus2 = await EnergyService.getEnergyStatus(testUser);
    console.log(`   Después de simular tiempo: ${energyStatus2.energia}/${energyStatus2.energiaMaxima}`);
    console.log(`   Energía regenerada: +${energyStatus2.energia - (testUser.energia - 30)}\n`);

    // Limpiar
    await User.deleteOne({ _id: testUser._id });

    console.log('========================');
    console.log('✅ ENERGY SYSTEM TEST PASSED');
    console.log('========================\n');

  } catch (error) {
    console.error('❌ ERROR:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testEnergySystem();