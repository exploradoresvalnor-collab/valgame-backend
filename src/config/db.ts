import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  if (!uri) throw new Error('Falta MONGODB_URI en el entorno');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[DB] Conectado a MongoDB');
}
