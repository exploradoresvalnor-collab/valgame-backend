/**
 * Script de migración para inicializar recursos de usuarios
 * Ejecutar: node scripts/migrate-user-resources.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Definir schema mínimo para actualizaciones
const UserSchema = new Schema({
  email: String,
  username: String,
  val: Number,
  boletos: Number,
  evo: Number,
  invocaciones: Number,
  evoluciones: Number,
  boletosDiarios: Number
}, { strict: false });

async function migrateUsers() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Buscar usuarios con recursos null o undefined
    const usersToMigrate = await User.find({
      $or: [
        { val: { $exists: false } },
        { val: null },
        { boletos: { $exists: false } },
        { boletos: null },
        { evo: { $exists: false } },
        { evo: null },
        { invocaciones: { $exists: false } },
        { invocaciones: null },
        { evoluciones: { $exists: false } },
        { evoluciones: null },
        { boletosDiarios: { $exists: false } },
        { boletosDiarios: null }
      ]
    });

    console.log(`📊 MIGRACIÓN DE RECURSOS:`);
    console.log(`   Usuarios a migrar: ${usersToMigrate.length}\n`);

    if (usersToMigrate.length === 0) {
      console.log('✅ No hay usuarios que migrar. Todos tienen recursos inicializados.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('🔧 Iniciando migración...\n');

    let migratedCount = 0;

    for (const user of usersToMigrate) {
      const updates = {};
      
      if (user.val === null || user.val === undefined) updates.val = 0;
      if (user.boletos === null || user.boletos === undefined) updates.boletos = 0;
      if (user.evo === null || user.evo === undefined) updates.evo = 0;
      if (user.invocaciones === null || user.invocaciones === undefined) updates.invocaciones = 0;
      if (user.evoluciones === null || user.evoluciones === undefined) updates.evoluciones = 0;
      if (user.boletosDiarios === null || user.boletosDiarios === undefined) updates.boletosDiarios = 0;

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        migratedCount++;
        console.log(`   ✓ ${user.username} (${user.email}) - Recursos inicializados`);
      }
    }

    console.log(`\n✅ MIGRACIÓN COMPLETADA:`);
    console.log(`   Usuarios migrados: ${migratedCount}`);
    console.log(`   Total usuarios en BD: ${await User.countDocuments()}\n`);

    // Verificación final
    const stillNullUsers = await User.find({
      $or: [
        { val: null },
        { boletos: null },
        { evo: null }
      ]
    });

    if (stillNullUsers.length > 0) {
      console.log(`⚠️  ADVERTENCIA: ${stillNullUsers.length} usuarios aún tienen recursos null\n`);
    } else {
      console.log('🎉 ÉXITO: Todos los usuarios tienen recursos inicializados correctamente\n');
    }

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR en migración:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateUsers();
