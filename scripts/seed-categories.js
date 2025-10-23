require('dotenv').config();
const mongoose = require('mongoose');

const categorias = [
  {
    nombre: "D",
    descripcion: "Común",
    multiplicador_minado: 1.0,
    probabilidad: 0.4
  },
  {
    nombre: "C",
    descripcion: "Normal",
    multiplicador_minado: 1.2,
    probabilidad: 0.3
  },
  {
    nombre: "B",
    descripcion: "Raro",
    multiplicador_minado: 1.5,
    probabilidad: 0.15
  },
  {
    nombre: "A",
    descripcion: "Épico",
    multiplicador_minado: 2.0,
    probabilidad: 0.08
  },
  {
    nombre: "S",
    descripcion: "Legendario",
    multiplicador_minado: 2.5,
    probabilidad: 0.05
  },
  {
    nombre: "SS",
    descripcion: "Mítico",
    multiplicador_minado: 3.0,
    probabilidad: 0.01
  },
  {
    nombre: "SSS",
    descripcion: "Trascendental",
    multiplicador_minado: 4.0,
    probabilidad: 0.01
  }
];

async function seedCategories() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('categories');

    // Verificar si ya existen categorías
    const existingCount = await collection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} categorías en la base de datos`);
      console.log('¿Quieres reemplazarlas? Ejecuta:');
      console.log('  node scripts/seed-categories.js --force\n');
      await mongoose.disconnect();
      return;
    }

    // Insertar categorías
    console.log('📦 Insertando categorías...\n');
    const result = await collection.insertMany(categorias);
    
    console.log(`✅ Insertadas ${result.insertedCount} categorías exitosamente\n`);
    
    // Mostrar resumen
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 CATEGORÍAS CREADAS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    categorias.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.nombre} - ${cat.descripcion}`);
      console.log(`   Multiplicador minado: ${cat.multiplicador_minado}x`);
      console.log(`   Probabilidad: ${(cat.probabilidad * 100).toFixed(1)}%`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Total probabilidades:', categorias.reduce((sum, c) => sum + c.probabilidad, 0).toFixed(2));
    console.log('═══════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

async function forceReplaceCategories() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('categories');

    // Borrar categorías existentes
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Borradas ${deleteResult.deletedCount} categorías antiguas\n`);

    // Insertar nuevas categorías
    console.log('📦 Insertando nuevas categorías...\n');
    const result = await collection.insertMany(categorias);
    
    console.log(`✅ Insertadas ${result.insertedCount} categorías exitosamente\n`);

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

// Main
const args = process.argv.slice(2);
if (args.includes('--force')) {
  forceReplaceCategories();
} else {
  seedCategories();
}
