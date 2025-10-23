import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  nombre: string;
  precio_usdt: number;
  precio_val?: number; // Precio alternativo en moneda VAL del juego
  personajes: number;
  categorias_garantizadas: string[];
  distribucion_aleatoria: string;
  // Recompensas opcionales cuando se abre el paquete
  val_reward?: number;
  items_reward?: any[]; // Array de ObjectId referencia a items
}

const PackageSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  precio_usdt: { type: Number, required: true },
  precio_val: { type: Number }, // Opcional
  personajes: { type: Number, required: true },
  categorias_garantizadas: [{ type: String }],
  distribucion_aleatoria: { type: String, required: true }
  ,
  val_reward: { type: Number },
  items_reward: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
}, { versionKey: false });

export default mongoose.model<IPackage>('Package', PackageSchema, 'packages');
