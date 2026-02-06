import mongoose from 'mongoose';
import dns from 'dns';

// Forzar DNS de Google para resolver registros SRV de MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDB(uri: string = process.env.MONGODB_URI || '') {
  // Si ya estamos conectados o conectando, no hacer nada.
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!uri) throw new Error('Falta MONGODB_URI en el entorno');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[DB] Conectado a MongoDB');
}

export async function disconnectDB() {
  // Si no estamos conectados, no hacer nada.
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  console.log('[DB] Desconectado de MongoDB');
}
