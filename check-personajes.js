const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  console.log('\n=== VERIFICACIÓN DE PERSONAJES EN BD ===\n');
  
  // 1. Personajes base
  const baseChars = await db.collection('base_characters').find({}).limit(5).toArray();
  console.log(`[BASE_CHARACTERS] Total encontrados: ${baseChars.length}`);
  if (baseChars.length > 0) {
    baseChars.forEach((char, idx) => {
      console.log(`  ${idx + 1}. ${char.nombre} (Rango: ${char.rango})`);
    });
  }
  
  // 2. User Characters (personajes creados por usuarios)
  const userChars = await db.collection('usercharacters').find({}).limit(5).toArray();
  console.log(`\n[USERCHARACTERS] Total encontrados: ${userChars.length}`);
  if (userChars.length > 0) {
    userChars.forEach((char, idx) => {
      console.log(`  ${idx + 1}. Usuario: ${char.userId}, Nombre: ${char.nombre} (Nivel: ${char.level})`);
    });
  }
  
  // 3. Usuarios con personajes embebidos
  const usersWithChars = await db.collection('users').find({ personajes: { $exists: true, $ne: [] } }).limit(3).toArray();
  console.log(`\n[USERS.PERSONAJES EMBEBIDOS] Total usuarios con personajes: ${usersWithChars.length}`);
  if (usersWithChars.length > 0) {
    usersWithChars.forEach((user, idx) => {
      console.log(`  ${idx + 1}. Usuario: ${user.username}`);
      if (user.personajes && user.personajes.length > 0) {
        user.personajes.forEach((p, pidx) => {
          console.log(`     ${pidx + 1}. ID: ${p.personajeId}, Rango: ${p.rango}, Nivel: ${p.nivel}`);
        });
      }
    });
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
