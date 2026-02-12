import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { Equipment } from '../models/Equipment';
import { Consumable } from '../models/Consumable';
import { User } from '../models/User';
import Listing from '../models/Listing';

async function setupMarketplace() {
  try {
    console.log('Iniciando configuración del marketplace...');
    console.log('URI de MongoDB:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
    // Conectar a MongoDB
    await connectDB();
    console.log('🔌 Conectado a MongoDB');

    // 1. Crear colección listings si no existe
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    
    const collections = await db.listCollections().toArray();
    const listingsExists = collections.some((col) => col.name === 'listings');

    if (!listingsExists && db) {
      await db.createCollection('listings');
      console.log('📦 Colección listings creada');
    } else if (listingsExists) {
      console.log('✅ Colección listings ya existe');
    } else {
      throw new Error('No se pudo crear la colección listings');
    }

    // 2. Crear índices para listings
    console.log('📊 Creando índices para listings...');
    await Promise.all([
      Listing.collection.createIndex({ estado: 1, fechaExpiracion: 1 }),
      Listing.collection.createIndex({ sellerId: 1, estado: 1 }),
      Listing.collection.createIndex({ type: 1, estado: 1 }),
      Listing.collection.createIndex({ precio: 1 }),
      Listing.collection.createIndex({ destacado: 1, fechaCreacion: -1 })
    ]);
    console.log('✅ Índices creados');

    // 3. Verificar colecciones requeridas
    const requiredCollections = ['items', 'users'];
    for (const colName of requiredCollections) {
      const exists = collections.some((col) => col.name === colName);
      if (!exists) {
        console.log(`⚠️ Advertencia: La colección ${colName} no existe`);
      } else {
        console.log(`✅ Colección ${colName} verificada`);
      }
    }

    // 4. Mostrar estadísticas
    const stats = {
      items: await Equipment.countDocuments(),
      consumibles: await Consumable.countDocuments(),
      usuarios: await User.countDocuments(),
      listings: await Listing.countDocuments()
    };

    console.log('\n📊 Estadísticas del sistema:');
    console.log('----------------------------');
    console.log(`Items de equipamiento: ${stats.items}`);
    console.log(`Items consumibles: ${stats.consumibles}`);
    console.log(`Usuarios registrados: ${stats.usuarios}`);
    console.log(`Listings activos: ${stats.listings}`);
    console.log('----------------------------');

    // 5. Verificar conexiones y referencias
    console.log('\n🔍 Verificando configuración del sistema...');
    const checkResults = await Promise.all([
      Equipment.findOne(),
      Consumable.findOne(),
      User.findOne()
    ]);

    const [equipment, consumable, user] = checkResults;
    console.log('✅ Modelo Equipment:', equipment ? 'OK' : 'Sin datos');
    console.log('✅ Modelo Consumable:', consumable ? 'OK' : 'Sin datos');
    console.log('✅ Modelo User:', user ? 'OK' : 'Sin datos');

    if (!equipment && !consumable) {
      console.log('\n⚠️ ADVERTENCIA: No hay items en el sistema.');
      console.log('Considera ejecutar el seeder de items primero: npm run seed');
    }

    console.log('\n✅ Configuración del marketplace completada');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupMarketplace()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { setupMarketplace };