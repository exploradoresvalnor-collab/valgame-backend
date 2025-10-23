import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BaseCharacter from '../src/models/BaseCharacter';

dotenv.config();

async function manageCharacters() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurada');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    // Leer todos los personajes actuales
    const personajes = await BaseCharacter.find({}).sort({ id: 1 }).lean().exec();

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 PERSONAJES ACTUALES EN BASE DE DATOS: ${personajes.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (personajes.length === 0) {
      console.log('⚠️  No hay personajes en la base de datos\n');
    } else {
      personajes.forEach((p: any, index: number) => {
        console.log(`\n${index + 1}. 🎭 ${p.nombre}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Nivel: ${p.nivel}`);
        console.log(`   Etapa: ${p.etapa}`);
        console.log(`   Stats: ATK ${p.stats.atk} | VIDA ${p.stats.vida} | DEF ${p.stats.defensa}`);
        console.log(`   Multiplicador base: ${p.multiplicador_base}`);
        console.log(`   VAL por nivel: [${p.val_por_nivel_por_etapa.join(', ')}]`);
        
        if (p.evoluciones && p.evoluciones.length > 0) {
          console.log(`   🔄 Evoluciones disponibles: ${p.evoluciones.length}`);
          p.evoluciones.forEach((ev: any, idx: number) => {
            console.log(`      ${idx + 1}. ${ev.nombre} (Etapa ${ev.etapa}) - Req: Nivel ${ev.requisitos.nivel}, ${ev.requisitos.val} VAL, ${ev.requisitos.evo} EVO`);
          });
        }

        if (p.imagen) {
          console.log(`   🖼️  Imagen: ${p.imagen}`);
        }
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🗑️  OPCIONES DE BORRADO');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Para borrar TODOS los personajes, ejecuta:');
    console.log('  npx ts-node scripts/manage-characters.ts delete-all\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

async function deleteAllCharacters() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurada');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    const count = await BaseCharacter.countDocuments();
    console.log(`⚠️  Se van a borrar ${count} personajes\n`);
    
    const result = await BaseCharacter.deleteMany({});
    console.log(`✅ Borrados ${result.deletedCount} personajes exitosamente\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (command === 'delete-all') {
  deleteAllCharacters();
} else {
  manageCharacters();
}
