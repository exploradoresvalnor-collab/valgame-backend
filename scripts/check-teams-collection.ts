import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db';

async function checkTeamsCollection() {
  try {
    console.log('🔍 Verificando colección Teams...');

    // Conectar a la base de datos
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame');

    // Listar todas las colecciones
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('No se pudo acceder a la base de datos');
    }

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('📋 Colecciones en la base de datos:');
    collectionNames.forEach(name => console.log(`  - ${name}`));

    // Verificar específicamente la colección teams
    const hasTeams = collectionNames.includes('teams');
    console.log(`\n🎯 ¿Existe colección 'teams'? ${hasTeams ? '✅ SÍ' : '❌ NO'}`);

    if (hasTeams) {
      // Contar documentos
      const count = await db.collection('teams').countDocuments();
      console.log(`📊 Documentos en 'teams': ${count}`);

      // Mostrar un ejemplo si hay documentos
      if (count > 0) {
        const sample = await db.collection('teams').findOne({});
        console.log('📝 Ejemplo de documento:');
        console.log(JSON.stringify(sample, null, 2));
      }
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

checkTeamsCollection();