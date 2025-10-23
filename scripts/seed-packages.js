require('dotenv').config();
const mongoose = require('mongoose');

const paquetes = [
  {
    nombre: "Huevo Básico",
    precio_usdt: 2,
    personajes: 1,
    categorias_garantizadas: [], // Sin garantía - completamente aleatorio
    distribucion_aleatoria: "ponderado" // Usa probabilidades de categories (40% D, 30% C, etc.)
  },
  {
    nombre: "Adventure",
    precio_usdt: 10,
    personajes: 5,
    categorias_garantizadas: [], // Sin garantía
    distribucion_aleatoria: "ponderado" // 5 personajes según probabilidades normales
  },
  {
    nombre: "Rugido Bestial",
    precio_usdt: 40,
    personajes: 20,
    categorias_garantizadas: ["A"], // Garantiza al menos 1 rango A
    distribucion_aleatoria: "ponderado" // Los otros 19 según probabilidades
  },
  {
    nombre: "Héroes de Leyenda",
    precio_usdt: 100,
    personajes: 20,
    categorias_garantizadas: ["A", "S"], // Garantiza al menos 1 A y 1 S
    distribucion_aleatoria: "ponderado" // Los otros 18 según probabilidades
  },
  {
    nombre: "Reinos Eternos",
    precio_usdt: 500,
    personajes: 20,
    categorias_garantizadas: ["A", "S", "SS", "SSS"], // Garantiza 1 de cada rango épico+
    distribucion_aleatoria: "ponderado" // Los otros 16 según probabilidades
  }
];

async function seedPackages() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('packages');

    // Verificar paquetes existentes
    const existingCount = await collection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} paquetes en la base de datos`);
      
      // Mostrar paquetes existentes
      const existing = await collection.find({}).toArray();
      console.log('\n📦 Paquetes existentes:');
      existing.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.nombre} - $${p.precio_usdt} USDT`);
      });
      
      console.log('\n¿Quieres reemplazarlos? Ejecuta:');
      console.log('  node scripts/seed-packages.js --force\n');
      await mongoose.disconnect();
      return;
    }

    // Insertar paquetes
    console.log('📦 Insertando paquetes...\n');
    const result = await collection.insertMany(paquetes);
    
    console.log(`✅ Insertados ${result.insertedCount} paquetes exitosamente\n`);
    
    // Mostrar resumen detallado
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 PAQUETES CREADOS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    paquetes.forEach((paq, index) => {
      console.log(`${index + 1}. 💎 ${paq.nombre}`);
      console.log(`   💰 Precio: $${paq.precio_usdt} USDT`);
      console.log(`   🎭 Personajes: ${paq.personajes}`);
      console.log(`   📊 Distribución: ${paq.distribucion_aleatoria}`);
      
      if (paq.categorias_garantizadas.length > 0) {
        console.log(`   ✨ Garantiza: ${paq.categorias_garantizadas.join(', ')}`);
      } else {
        console.log(`   🎲 Sin garantías (100% aleatorio)`);
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 EXPLICACIÓN DE DISTRIBUCIÓN');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('"ponderado" = Usa las probabilidades de categories:');
    console.log('  • D: 40%, C: 30%, B: 15%, A: 8%, S: 5%, SS: 1%, SSS: 1%');
    console.log('\n"categorias_garantizadas" = Asegura estos rangos primero,');
    console.log('  luego el resto se distribuye según "ponderado"\n');

    console.log('═══════════════════════════════════════════════════════════');
    const totalValue = paquetes.reduce((sum, p) => sum + p.precio_usdt, 0);
    console.log(`💰 Valor total de todos los paquetes: $${totalValue} USDT`);
    console.log('═══════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

async function forceReplacePackages() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('packages');

    // Borrar paquetes existentes
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Borrados ${deleteResult.deletedCount} paquetes antiguos\n`);

    // Insertar nuevos paquetes
    console.log('📦 Insertando nuevos paquetes...\n');
    const result = await collection.insertMany(paquetes);
    
    console.log(`✅ Insertados ${result.insertedCount} paquetes exitosamente\n`);

    // Mostrar resumen
    paquetes.forEach((paq, index) => {
      console.log(`${index + 1}. ${paq.nombre} - $${paq.precio_usdt} USDT - ${paq.personajes} personajes`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

// Main
const args = process.argv.slice(2);
if (args.includes('--force')) {
  forceReplacePackages();
} else {
  seedPackages();
}
