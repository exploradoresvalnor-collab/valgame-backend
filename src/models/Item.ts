import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  nombre: string;
  descripcion: string;
  tasa_cambio_usdt?: number;
  costo_val?: number;
  fuentes_obtencion: string[];
  detalle_uso?: string;
  limites?: string;
  requisito_evolucion?: string;
  rareza?: string;
}

const ItemSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  tasa_cambio_usdt: { type: Number },
  costo_val: { type: Number },
  fuentes_obtencion: [{ type: String, required: true }],
  detalle_uso: { type: String },
  limites: { type: String },
  requisito_evolucion: { type: String },
  rareza: { type: String }
}, { versionKey: false });

export default mongoose.model<IItem>('Item', ItemSchema, 'items');
