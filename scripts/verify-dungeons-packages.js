require('dotenv').config();
const mongoose = require('mongoose');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('\n‚ïê'.repeat(80));
    console.log('Ì¥ç VERIFICACI√ìN COMPLETA: DUNGEONS Y PACKAGES');
    console.log('‚ïê'.repeat(80) + '\n');

    // DUNGEONS - Ver estructura completa
    console.log('Ìø∞ DUNGEONS - Estructura completa:\n');
    const dungeons = await db.collection('dungeons').find({}).toArray();
    
    dungeons.forEach((d, i) => {
      console.log(`[${i+1}] ${d.nombre}`);
      console.log(JSON.stringify(d, null, 2));
      console.log('‚îÄ'.repeat(80) + '\n');
    });

    // PACKAGES - Ver estructura completa
    console.log('\nÌ≥¶ PACKAGES - Estructura completa:\n');
    const packages = await db.collection('packages').find({}).toArray();
    
    packages.forEach((p, i) => {
      console.log(`[${i+1}] ${p.nombre}`);
      console.log(JSON.stringify(p, null, 2));
      console.log('‚îÄ'.repeat(80) + '\n');
    });

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n‚ùå Error:', error.message);
    process.exit(1);
  }
}

verify();
