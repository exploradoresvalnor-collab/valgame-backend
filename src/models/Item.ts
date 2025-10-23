import mongoose, { Schema, Document, SchemaOptions } from 'mongoose';

// Opciones para el schema base, clave para los discriminadores
const baseOptions: SchemaOptions = {
  discriminatorKey: 'tipoItem', // Campo que define el tipo de item
  collection: 'items',          // Todos los items vivirán en esta colección
  versionKey: false,
  timestamps: true
};

// --- INTERFAZ BASE DEL ITEM ---
// Contiene todos los campos comunes a cualquier tipo de item
export interface IItem extends Document {
  nombre: string;
  descripcion: string;
  imagen?: string; // URL de la imagen del item (para marketplace y UI)
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  tipoItem?: string;
  // Campos opcionales que pueden o no estar
  tasa_cambio_usdt?: number;
  costo_val?: number;
  fuentes_obtencion?: string[];
  detalle_uso?: string;
  limites?: string;
  requisito_evolucion?: string;
}

// --- SCHEMA BASE DEL ITEM ---
// Define la estructura común
const ItemSchema: Schema = new Schema({
  nombre: { type: String, required: true, index: true },
  descripcion: { type: String, required: true },
  imagen: { type: String }, // URL de la imagen (opcional para compatibilidad)
  rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
  tasa_cambio_usdt: { type: Number },
  costo_val: { type: Number },
  fuentes_obtencion: [{ type: String }],
  detalle_uso: { type: String },
  limites: { type: String },
  requisito_evolucion: { type: String }
}, baseOptions);

// --- EXPORTACIÓN DEL MODELO BASE ---
// A partir de este modelo se crearán los demás tipos de items
export const Item = mongoose.model<IItem>('Item', ItemSchema);