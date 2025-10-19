/**
 * Script de Migración de Colecciones
 * 
 * Este script renombra colecciones con nombres en español a inglés
 * para mantener consistencia en la base de datos.
 * 
 * ADVERTENCIA: Este script modifica la base de datos directamente.
 * Asegúrate de hacer un backup antes de ejecutarlo.
 * 
 * Uso:
 *   npm run migrate:collections
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

interface CollectionMapping {
  oldName: string;
  newName: string;
  description: string;
}

const COLLECTION_MAPPINGS: CollectionMapping[] = [
  {
    oldName: 'categorias',
    newName: 'categories',
    description: 'Categorías de personajes'
  },
  {
    oldName: 'paquetes',
    newName: 'packages',
    description: 'Paquetes de compra'
  },
  {
    oldName: 'personajes_base',
    newName: 'base_characters',
    description: 'Personajes base del catálogo'
  },
  {
    oldName: 'configuracion_juego',
    newName: 'game_settings',
    description: 'Configuración global del juego'
  },
  {
    oldName: 'requisitos_nivel',
    newName: 'level_requirements',
    description: 'Requisitos de experiencia por nivel'
  },
  {
    oldName: 'eventos',
    newName: 'events',
    description: 'Eventos del juego'
  },
  {
    oldName: 'playerstats',
    newName: 'player_stats',
    description: 'Estadísticas de jugadores'
  }
];

async function collectionExists(db: mongoose.Connection['db'], name: string): Promise<boolean> {
  if (!db) {
    throw new Error('Database instance is undefined');
  }
  const collections = await db.listCollections({ name }).toArray();
  return collections.length > 0;
}

async function migrateCollections() {
  try {
    console.log('🔄 Iniciando migración de colecciones...\n');

    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('No se pudo obtener la instancia de la base de datos');
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Procesar cada mapeo
    for (const mapping of COLLECTION_MAPPINGS) {
      console.log(`📦 Procesando: ${mapping.oldName} → ${mapping.newName}`);
      console.log(`   Descripción: ${mapping.description}`);

      try {
        // Verificar si la colección antigua existe
        const oldExists = await collectionExists(db, mapping.oldName);
        const newExists = await collectionExists(db, mapping.newName);

        if (!oldExists && !newExists) {
          console.log(`   ⚠️  Ninguna colección existe (puede ser normal si no se ha usado)\n`);
          skippedCount++;
          continue;
        }

        if (!oldExists && newExists) {
          console.log(`   ✅ Ya migrada (solo existe ${mapping.newName})\n`);
          skippedCount++;
          continue;
        }

        if (oldExists && newExists) {
          console.log(`   ⚠️  Ambas colecciones existen. Requiere intervención manual.`);
          console.log(`   💡 Sugerencia: Revisa los datos y elimina la colección antigua manualmente.\n`);
          errorCount++;
          continue;
        }

        // Renombrar la colección
        await db.renameCollection(mapping.oldName, mapping.newName);
        console.log(`   ✅ Migrada exitosamente\n`);
        migratedCount++;

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    // Resumen
    console.log('━'.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('━'.repeat(60));
    console.log(`✅ Migradas:  ${migratedCount}`);
    console.log(`⏭️  Omitidas:  ${skippedCount}`);
    console.log(`❌ Errores:   ${errorCount}`);
    console.log(`📦 Total:     ${COLLECTION_MAPPINGS.length}`);
    console.log('━'.repeat(60));

    if (errorCount > 0) {
      console.log('\n⚠️  Algunas colecciones requieren atención manual.');
      console.log('   Revisa los errores arriba para más detalles.');
    }

    if (migratedCount > 0) {
      console.log('\n✅ Migración completada. Actualiza tus modelos de Mongoose para usar los nuevos nombres.');
    }

  } catch (error: any) {
    console.error('❌ Error fatal durante la migración:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración
if (require.main === module) {
  console.log('⚠️  ADVERTENCIA: Este script modificará tu base de datos.');
  console.log('   Asegúrate de tener un backup antes de continuar.\n');

  // Dar tiempo para cancelar (Ctrl+C)
  setTimeout(() => {
    migrateCollections()
      .then(() => {
        console.log('\n✅ Script completado');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Script falló:', error);
        process.exit(1);
      });
  }, 3000);

  console.log('⏳ Iniciando en 3 segundos... (Ctrl+C para cancelar)');
}

export { migrateCollections };
