require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está configurado');
  process.exit(1);
}

async function readAllCollections() {
  try {
    console.log('\n��� Conectando a MongoDB Atlas...\n');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('✅ Conectado\n');
    console.log('═'.repeat(80));
    console.log('��� LECTURA DE COLECCIONES');
    console.log('═'.repeat(80) + '\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log(`��� Total: ${collections.length} colecciones\n`);
    console.log('COLECCIÓN'.padEnd(30) + 'DOCUMENTOS'.padEnd(15) + 'ESTADO');
    console.log('─'.repeat(80));

    const stats = [];
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      const status = count === 0 ? '⚠️ VACÍA' : count < 5 ? '⚠️ POCOS' : '✅ OK';
      console.log(col.name.padEnd(30) + count.toString().padEnd(15) + status);
      stats.push({ name: col.name, count });
    }

    console.log('─'.repeat(80) + '\n');
    console.log('═'.repeat(80));
    console.log('��� VALIDACIÓN DE CRÍTICAS');
    console.log('═'.repeat(80) + '\n');

    const critical = ['users', 'items', 'dungeons', 'game_settings', 'survival_sessions'];
    
    for (const name of critical) {
      const stat = stats.find(s => s.name === name);
      const emoji = !stat ? '❌' : stat.count === 0 ? '❌' : '✅';
      const count = stat ? stat.count : 0;
      console.log(`${emoji} ${name.padEnd(25)} - ${count} docs\n`);
    }

    console.log('═'.repeat(80));
    const totalDocs = stats.reduce((sum, s) => sum + s.count, 0);
    console.log(`✅ TOTAL: ${stats.length} colecciones, ${totalDocs} documentos`);
    console.log('═'.repeat(80) + '\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

readAllCollections();
