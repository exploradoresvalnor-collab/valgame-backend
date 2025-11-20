import mongoose from 'mongoose';
import GameSetting from '../src/models/GameSetting';
import dotenv from 'dotenv';

dotenv.config();

async function updateMaxPersonajesPorEquipo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame');
    console.log('✅ Conectado a MongoDB');

    // Buscar todos los documentos de game settings
    const gameSettings = await GameSetting.find({});
    console.log(`📊 Encontrados ${gameSettings.length} documentos de game settings`);

    // Actualizar cada documento
    for (const setting of gameSettings) {
      console.log(`\n🔄 Actualizando documento ${setting._id}:`);
      console.log(`   Antes: MAX_PERSONAJES_POR_EQUIPO = ${setting.MAX_PERSONAJES_POR_EQUIPO}`);

      // Actualizar el valor
      setting.MAX_PERSONAJES_POR_EQUIPO = 9;
      await setting.save();

      console.log(`   Después: MAX_PERSONAJES_POR_EQUIPO = ${setting.MAX_PERSONAJES_POR_EQUIPO}`);
    }

    console.log('\n✅ Actualización completada exitosamente');
    console.log('🎯 Nuevo límite: 9 personajes por equipo');

  } catch (error) {
    console.error('❌ Error actualizando game settings:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

updateMaxPersonajesPorEquipo();