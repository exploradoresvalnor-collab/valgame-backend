require('dotenv').config();
const mongoose = require('mongoose');

// Paquete Pionero - Regalo de bienvenida al validar cuenta
const paquetePionero = {
  nombre: "Paquete Pionero",
  precio_usdt: 0, // Gratis - regalo de bienvenida
  personajes: 1, // 1 personaje aleatorio
  categorias_garantizadas: [], // Sin garantías - completamente aleatorio según probabilidades
  distribucion_aleatoria: "ponderado", // Usa probabilidades de categories (40% D, 30% C, etc.)
  val_reward: 0, // Sin VAL adicional
  items_reward: [] // Los items se asignan dinámicamente al abrir (2 items aleatorios)
  // NOTA: items_reward vacío porque los items se sortean al momento de abrir el paquete
  // según los items disponibles en la colección 'items'
};

async function addPaquetePionero() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('packages');

    // Verificar si ya existe el Paquete Pionero
    const existing = await collection.findOne({ nombre: "Paquete Pionero" });
    
    if (existing) {
      console.log('⚠️  El Paquete Pionero ya existe\n');
      console.log('Paquete actual:');
      console.log(`  Precio: $${existing.precio_usdt} USDT`);
      console.log(`  Personajes: ${existing.personajes}`);
      console.log(`  Items reward: ${existing.items_reward ? existing.items_reward.length : 0}`);
      console.log('\n¿Quieres actualizarlo? Ejecuta:');
      console.log('  node scripts/add-paquete-pionero.js --force\n');
      await mongoose.disconnect();
      return;
    }

    // Insertar Paquete Pionero
    console.log('📦 Insertando Paquete Pionero...\n');
    const result = await collection.insertOne(paquetePionero);
    
    console.log('✅ Paquete Pionero creado exitosamente\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎁 PAQUETE PIONERO - REGALO DE BIENVENIDA');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📋 Detalles:');
    console.log('  💰 Precio: GRATIS ($0 USDT)');
    console.log('  🎭 Personajes: 1 (aleatorio según probabilidades)');
    console.log('  🎲 Distribución: ponderado');
    console.log('  📦 Items: 2 aleatorios (se sortean al abrir)\n');
    
    console.log('💡 Funcionamiento:');
    console.log('  1. Se da automáticamente al validar la cuenta');
    console.log('  2. El personaje se sortea según probabilidades:');
    console.log('     • D: 40%, C: 30%, B: 15%, A: 8%, S: 5%, SS: 1%, SSS: 1%');
    console.log('  3. Los 2 items se sortean de los disponibles en la BD\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    
    // Contar todos los paquetes
    const totalPackages = await collection.countDocuments();
    console.log(`📊 Total de paquetes en BD: ${totalPackages}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

async function forceUpdatePaquetePionero() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('packages');

    // Actualizar o insertar Paquete Pionero
    const result = await collection.updateOne(
      { nombre: "Paquete Pionero" },
      { $set: paquetePionero },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ Paquete Pionero creado\n');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Paquete Pionero actualizado\n');
    } else {
      console.log('ℹ️  Paquete Pionero ya estaba actualizado\n');
    }

    // Mostrar resumen
    const paquetes = await collection.find({}).sort({ precio_usdt: 1 }).toArray();
    console.log('📦 Paquetes en BD:');
    paquetes.forEach((p, i) => {
      const gratis = p.precio_usdt === 0 ? '🎁 ' : '';
      console.log(`  ${i+1}. ${gratis}${p.nombre} - $${p.precio_usdt} USDT - ${p.personajes} personajes`);
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
  forceUpdatePaquetePionero();
} else {
  addPaquetePionero();
}
