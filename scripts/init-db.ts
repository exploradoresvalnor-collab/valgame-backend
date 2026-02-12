import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import Listing from '../models/Listing';
import '../models/User';
import '../models/Item';
import '../models/Consumable';
import '../models/Equipment';

async function initializeDatabase() {
  try {
    // Conectar a MongoDB usando la configuración centralizada
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('No se pudo obtener la conexión a la base de datos');
    }

    // Crear colección de listings si no existe
    const collections = await db.listCollections().toArray();
    const listingsExists = collections.some((col) => col.name === 'listings');

    if (!listingsExists) {
      await db.createCollection('listings');
      console.log('[INIT-DB] Colección listings creada');
    } else {
      console.log('[INIT-DB] Colección listings ya existe');
    }

    // Crear índices necesarios (sin TTL). Usamos la colección de Listing de Mongoose
    await Promise.all([
      Listing.collection.createIndex({ estado: 1, fechaExpiracion: 1 }),
      Listing.collection.createIndex({ sellerId: 1, estado: 1 }),
      Listing.collection.createIndex({ type: 1, estado: 1 }),
      Listing.collection.createIndex({ precio: 1 }),
      Listing.collection.createIndex({ destacado: 1, fechaCreacion: -1 })
    ]);
    console.log('[INIT-DB] Índices creados para listings');

    console.log('[INIT-DB] Inicialización de la base de datos completada');
  } catch (error) {
    console.error('[INIT-DB] Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { initializeDatabase };
