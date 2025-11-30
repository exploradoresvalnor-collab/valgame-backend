require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n' + '‚ïê'.repeat(80));
console.log('Ì¥ç VERIFICAR CONEXI√ìN A MONGODB');
console.log('‚ïê'.repeat(80) + '\n');

console.log(`Ì≥ç MONGODB_URI: ${process.env.MONGODB_URI?.substring(0, 50)}...`);

async function checkConnection() {
  try {
    console.log('\nÌ¥ó Intentando conectar...\n');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    console.log('‚úÖ CONECTADO A MONGODB');
    console.log(`   Estado: ${mongoose.connection.readyState}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   DB: ${mongoose.connection.db.getName()}\n`);

    await mongoose.disconnect();
    console.log('‚úÖ Desconectado correctamente\n');
    process.exit(0);

  } catch (error) {
    console.error('\n‚ùå ERROR DE CONEXI√ìN A MONGODB:\n');
    console.error(`   C√≥digo: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Detalle: ${error.reason?.message || error.reason}\n`);

    console.log('‚ïê'.repeat(80));
    console.log('Ì≤° SOLUCIONES:');
    console.log('‚ïê'.repeat(80) + '\n');

    if (error.code === 'ENOTFOUND') {
      console.log('‚ùå No se encuentra el host de MongoDB');
      console.log('   Verifica que la URL sea correcta\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('‚ùå Conexi√≥n rechazada por MongoDB');
      console.log('   Si usas MongoDB Atlas, verifica:');
      console.log('   1. Tu IP est√° en la lista blanca de Atlas');
      console.log('   2. Las credenciales son correctas');
      console.log('   3. Tu conexi√≥n a internet funciona\n');
    } else if (error.message?.includes('auth failed')) {
      console.log('‚ùå Error de autenticaci√≥n');
      console.log('   Verifica usuario y contrase√±a en MONGODB_URI\n');
    }

    process.exit(1);
  }
}

checkConnection();
