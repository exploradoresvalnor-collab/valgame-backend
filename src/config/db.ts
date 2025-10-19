import mongoose from 'mongoose';

export async function connectDB(uri: string = process.env.MONGODB_URI || '') {
  if (!uri) throw new Error('Falta MONGODB_URI en el entorno');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[DB] Conectado a MongoDB');
}

export async function disconnectDB() {
  await mongoose.connection.close();
  console.log('[DB] Desconectado de MongoDB');
}
