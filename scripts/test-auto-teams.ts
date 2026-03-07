import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Team } from '../src/models/Team';
import { deliverPioneerPackage } from '../src/services/onboarding.service';
import { connectDB, disconnectDB } from '../src/config/db';

async function testAutoTeamCreation() {
  try {
    console.log('🧪 Probando creación automática de equipos...\n');

    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame');

    // Crear un usuario de prueba
    const testUser = new User({
      email: `test_auto_team_${Date.now()}@test.com`,
      username: `test_auto_team_${Date.now()}`,
      passwordHash: 'hashedpassword',
      isVerified: false
    });

    await testUser.save();
    console.log(`✅ Usuario creado: ${testUser.email}`);

    // Ejecutar onboarding (esto debería crear el equipo automáticamente)
    console.log('\n🎯 Ejecutando onboarding...');
    const result = await deliverPioneerPackage(testUser);

    if (result.delivered) {
      console.log('✅ Onboarding completado');
      console.log('🎁 Recompensas:', result.rewards);

      // Verificar que se creó el equipo
      const teams = await Team.find({ userId: testUser._id });
      console.log(`\n📊 Equipos encontrados: ${teams.length}`);

      if (teams.length > 0) {
        console.log('✅ ¡Equipo creado automáticamente!');
        console.log('📝 Detalles del equipo:');
        console.log(`   - Nombre: ${teams[0].name}`);
        console.log(`   - Activo: ${teams[0].isActive}`);
        console.log(`   - Personajes: ${teams[0].characters.length}`);

        // Verificar que el usuario tiene el equipoActivoId
        const updatedUser = await User.findById(testUser._id);
        const hasActiveTeam = updatedUser?.equipoActivoId?.toString() === teams[0]._id.toString();
        console.log(`   - Usuario tiene equipo activo: ${hasActiveTeam ? '✅' : '❌'}`);
      } else {
        console.log('❌ No se creó ningún equipo');
      }
    } else {
      console.log('❌ Onboarding falló:', result.reason);
    }

    // Limpiar datos de prueba
    await Team.deleteMany({ userId: testUser._id });
    await User.findByIdAndDelete(testUser._id);
    console.log('\n🧹 Datos de prueba limpiados');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

testAutoTeamCreation();