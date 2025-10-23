/**
 * Verificar qué personajes base existen en la BD
 */

import mongoose from 'mongoose';
import BaseCharacter from '../src/models/BaseCharacter';
import dotenv from 'dotenv';

dotenv.config();

async function checkBaseCharacters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado a MongoDB\n');

    const characters = await BaseCharacter.find();
    console.log(`📊 Total de personajes base: ${characters.length}\n`);

    if (characters.length === 0) {
      console.log('❌ NO HAY PERSONAJES BASE EN LA BD!\n');
      console.log('💡 Esto explica por qué el test falla.');
      console.log('   Los paquetes intentan dar personajes pero no hay ninguno disponible.\n');
    } else {
      console.log('📋 Personajes base encontrados:\n');
      characters.forEach((char: any) => {
        console.log(`   - ${char.nombre || char.name || char.id}: ${char.categoria || 'Sin categoría'}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkBaseCharacters();
