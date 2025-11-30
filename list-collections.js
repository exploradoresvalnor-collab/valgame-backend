const mongoose = require('mongoose');
require('dotenv').config();

async function listCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 COLECCIONES EN LA BD:\n');
    collections.forEach((col, idx) => {
      console.log(`${idx + 1}. ${col.name}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

listCollections();
