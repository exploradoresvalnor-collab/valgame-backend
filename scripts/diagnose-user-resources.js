/**
 * Script de diagnóstico para verificar recursos de usuarios
 * Ejecutar: node scripts/diagnose-user-resources.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Definir schema mínimo para consultas
const UserSchema = new Schema({
  email: String,
  username: String,
  val: Number,
  boletos: Number,
  evo: Number,
  invocaciones: Number,
  evoluciones: Number
}, { strict: false });

async function diagnoseUsers() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const totalUsers = await User.countDocuments();
    
    console.log(`📊 DIAGNÓSTICO DE USUARIOS:`);
    console.log(`   Total usuarios: ${totalUsers}\n`);

    // Buscar usuarios con recursos null o undefined
    const usersWithNullResources = await User.find({
      $or: [
        { val: { $exists: false } },
        { val: null },
        { boletos: { $exists: false } },
        { boletos: null },
        { evo: { $exists: false } },
        { evo: null }
      ]
    }).select('email username val boletos evo invocaciones evoluciones');

    if (usersWithNullResources.length === 0) {
      console.log('✅ PERFECTO: Todos los usuarios tienen recursos inicializados correctamente.');
    } else {
      console.log(`⚠️  PROBLEMA: ${usersWithNullResources.length} usuarios tienen recursos NULL:\n`);
      
      usersWithNullResources.forEach((user, index) => {
        console.log(`${index + 1}. Usuario: ${user.username} (${user.email})`);
        console.log(`   val: ${user.val === null ? 'NULL' : user.val === undefined ? 'UNDEFINED' : user.val}`);
        console.log(`   boletos: ${user.boletos === null ? 'NULL' : user.boletos === undefined ? 'UNDEFINED' : user.boletos}`);
        console.log(`   evo: ${user.evo === null ? 'NULL' : user.evo === undefined ? 'UNDEFINED' : user.evo}`);
        console.log(`   invocaciones: ${user.invocaciones === null ? 'NULL' : user.invocaciones === undefined ? 'UNDEFINED' : user.invocaciones}`);
        console.log(`   evoluciones: ${user.evoluciones === null ? 'NULL' : user.evoluciones === undefined ? 'UNDEFINED' : user.evoluciones}\n`);
      });
      
      console.log(`\n💡 SOLUCIÓN: Ejecuta el script de migración:`);
      console.log(`   node scripts/migrate-user-resources.js\n`);
    }

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

diagnoseUsers();
