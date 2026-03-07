const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkMongoDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame';

  console.log('🔍 Verificando estado de MongoDB...');
  console.log(`📍 URI: ${MONGODB_URI}`);

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    await client.connect();
    console.log('✅ MongoDB está conectado y funcionando');

    // Verificar base de datos
    const db = client.db();
    const dbName = db.databaseName;
    console.log(`📊 Base de datos: ${dbName}`);

    // Listar colecciones
    const collections = await db.listCollections().toArray();
    console.log(`📋 Colecciones encontradas: ${collections.length}`);

    if (collections.length > 0) {
      console.log('   - ' + collections.map(c => c.name).join('\n   - '));
    }

    await client.close();

    console.log('\n🎯 Estado: LISTO PARA USAR');
    console.log('💡 El sistema puede funcionar con base de datos real');

  } catch (error) {
    console.log('❌ MongoDB no está disponible');
    console.log(`📝 Error: ${error.message}`);

    console.log('\n🔧 Soluciones:');
    console.log('1. Si usas MongoDB local:');
    console.log('   - Instala MongoDB: choco install mongodb');
    console.log('   - Inicia el servicio: net start MongoDB');
    console.log('');
    console.log('2. Si usas MongoDB Atlas:');
    console.log('   - Verifica tu conexión a internet');
    console.log('   - Revisa la whitelist de IP en Atlas');
    console.log('   - Verifica las credenciales en .env');
    console.log('');
    console.log('3. Para desarrollo sin BD:');
    console.log('   - Ejecuta: node switch-mode.js dev');
    console.log('   - El sistema funcionará con datos ficticios');

    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkMongoDB();
}

module.exports = { checkMongoDB };