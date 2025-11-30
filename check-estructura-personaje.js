const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  console.log('\n=== ESTRUCTURA COMPLETA DE PERSONAJE BASE ===\n');
  
  // Obtener un personaje base completo
  const char = await db.collection('base_characters').findOne({});
  
  if (char) {
    console.log(JSON.stringify(char, null, 2));
  } else {
    console.log('No encontrado');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
