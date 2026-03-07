#!/usr/bin/env node

/**
 * Script para verificar la colección 'teams' en MongoDB
 * Uso: node scripts/verify-teams-collection.js
 */

const mongoose = require('mongoose');

async function verifyTeamsCollection() {
  console.log('🔍 Verificando colección teams en MongoDB...\n');

  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame';
    console.log(`📡 Conectando a: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('✅ Conexión exitosa a MongoDB\n');

    // Verificar si existe la colección
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('📋 Colecciones encontradas:');
    collectionNames.forEach(name => console.log(`   - ${name}`));
    console.log('');

    const hasTeams = collectionNames.includes('teams');

    if (hasTeams) {
      console.log('✅ ¡LA COLECCIÓN "teams" EXISTE!\n');

      // Contar documentos
      const count = await db.collection('teams').countDocuments();
      console.log(`📊 Documentos en teams: ${count}`);

      if (count > 0) {
        console.log('\n📝 Muestra de documentos:');
        const sample = await db.collection('teams').findOne({});
        console.log(JSON.stringify(sample, null, 2));
      }

      console.log('\n🎉 La colección teams está lista y funcionando!');

    } else {
      console.log('❌ La colección "teams" NO existe aún');
      console.log('💡 Se creará automáticamente cuando:');
      console.log('   - Se ejecute el primer test');
      console.log('   - Se cree el primer equipo');
      console.log('   - Se despliegue en producción');
    }

  } catch (error) {
    console.error('❌ Error al verificar colección:', error.message);
    console.log('\n💡 Posibles causas:');
    console.log('   - MongoDB no está ejecutándose');
    console.log('   - URI de conexión incorrecta');
    console.log('   - Problemas de red');
  } finally {
    await mongoose.disconnect();
  }
}

verifyTeamsCollection();