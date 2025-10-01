import mongoose, { Schema, Document } from 'mongoose';

/**
 * @interface IOfferItem
 * Define la estructura de un ítem o paquete que forma parte de la oferta.
 * Puede ser un paquete existente, un ítem específico, o una cantidad de moneda virtual.
 */
export interface IOfferItem {
  tipo: 'paquete' | 'item' | 'val' | 'evo' | 'boleto';
  refId: string; // ID del paquete o ítem. 'N/A' si es moneda.
  cantidad: number;
}

/**
 * @interface IOffer
 * Representa una oferta especial o promoción en el juego.
 */
export interface IOffer extends Document {
  nombre: string;
  descripcion: string;
  imagenUrl?: string;
  items: IOfferItem[];
  precioUSDT?: number; // Precio final en USDT si es una compra directa
  precioVal?: number; // Precio final en VAL si es una compra con moneda del juego
  descuentoPorcentual?: number; // Porcentaje de descuento sobre el precio original
  fechaInicio: Date;
  fechaFin: Date;
  limitePorUsuario: number; // Cuántas veces un usuario puede comprar esta oferta (0 para ilimitado)
  limiteTotal?: number; // Cuántas veces se puede comprar la oferta en total (opcional)
  activo: boolean; // Para activar/desactivar la oferta fácilmente
}

const OfferItemSchema: Schema = new Schema({
  tipo: { type: String, enum: ['paquete', 'item', 'val', 'evo', 'boleto'], required: true },
  refId: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 }
}, { _id: false });

const OfferSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  imagenUrl: { type: String },
  items: { type: [OfferItemSchema], required: true },
  precioUSDT: { type: Number, min: 0 },
  precioVal: { type: Number, min: 0 },
  descuentoPorcentual: { type: Number, min: 0, max: 100 },
  fechaInicio: { type: Date, required: true, index: true },
  fechaFin: { type: Date, required: true, index: true },
  limitePorUsuario: { type: Number, default: 1, min: 0 },
  limiteTotal: { type: Number, min: 0 },
  activo: { type: Boolean, default: true, index: true }
}, {
  timestamps: true,
  versionKey: false
});

// Índice para buscar ofertas activas dentro de un rango de fechas
OfferSchema.index({ activo: 1, fechaInicio: 1, fechaFin: 1 });

export default mongoose.model<IOffer>('Offer', OfferSchema, 'offers');