import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BaseCharacter from '../src/models/BaseCharacter';

dotenv.config();

async function checkDescripcionRango() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Conectado a MongoDB');

    const characters = await BaseCharacter.find().select('nombre descripcion_rango');
    
    console.log(`\n📊 Total de personajes base: ${characters.length}`);
    console.log('📋 descripcion_rango de cada personaje:\n');
    
    characters.forEach((char) => {
      console.log(`   - ${char.nombre}:`);
      console.log(`     descripcion_rango: "${char.descripcion_rango}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDescripcionRango();
