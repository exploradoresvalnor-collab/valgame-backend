import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  nombre: string;
  precio_usdt: number;
  personajes: number;
  categorias_garantizadas: string[];
  distribucion_aleatoria: string;
}

const PackageSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  precio_usdt: { type: Number, required: true },
  personajes: { type: Number, required: true },
  categorias_garantizadas: [{ type: String }],
  distribucion_aleatoria: { type: String, required: true }
}, { versionKey: false });

export default mongoose.model<IPackage>('Package', PackageSchema, 'packages');
