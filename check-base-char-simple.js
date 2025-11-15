require('dotenv').config();
const mongoose = require('mongoose');

async function checkBaseCharacters() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    console.log('🔍 Buscando BaseCharacters...\n');
    
    const characters = await mongoose.connection.db.collection('basecharacters').find({}).toArray();
    
    console.log(`📊 Total de personajes: ${characters.length}\n`);
    
    if (characters.length > 0) {
      console.log('🎭 Personajes encontrados:');
      characters.forEach((char, i) => {
        console.log(`\n${i + 1}. ${char.nombre}`);
        console.log(`   descripcion_rango: ${char.descripcion_rango || 'NO TIENE'}`);
        console.log(`   slug: ${char.slug}`);
        console.log(`   stats: vida=${char.stats?.vida}, ataque=${char.stats?.ataque}, defensa=${char.stats?.defensa}`);
      });
      
      console.log('\n\n🔍 Buscando personaje con descripcion_rango = "D"...');
      const rangoD = characters.find(c => c.descripcion_rango === 'D');
      
      if (rangoD) {
        console.log('✅ ENCONTRADO:');
        console.log(JSON.stringify(rangoD, null, 2));
      } else {
        console.log('❌ NO hay ningún personaje con descripcion_rango = "D"');
        console.log('\n💡 Solución: Actualizar uno de los personajes existentes');
      }
    } else {
      console.log('❌ No hay personajes en la base de datos');
      console.log('Ejecuta: node scripts/seed-base-characters.js --force');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

checkBaseCharacters();
