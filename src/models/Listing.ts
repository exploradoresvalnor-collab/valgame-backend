import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  itemId: string;
  type: 'personaje' | 'equipamiento' | 'consumible' | 'especial';
  sellerId: mongoose.Types.ObjectId;
  precio: number;
  precioOriginal: number;
  impuesto: number;
  estado: 'activo' | 'vendido' | 'cancelado' | 'expirado';
  fechaCreacion: Date;
  fechaExpiracion: Date;
  fechaVenta?: Date;
  buyerId?: mongoose.Types.ObjectId;
  destacado: boolean;
  metadata: {
    // Información de display (común a todos los tipos)
    nombre?: string;
    imagen?: string;
    descripcion?: string;
    // Información específica por tipo
    nivel?: number;
    etapa?: number;  // Etapa de evolución (1, 2, 3)
    rango?: string;
    durabilidad?: number;
    usos?: number;
    stats?: {
      atk?: number;
      defensa?: number;
      vida?: number;
    }
  }
}

const ListingSchema = new Schema({
  itemId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['personaje', 'equipamiento', 'consumible', 'especial']
  },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  precio: { type: Number, required: true, min: 1 },
  precioOriginal: { type: Number, required: true },
  impuesto: { type: Number, required: true },
  estado: { 
    type: String, 
    required: true,
    enum: ['activo', 'vendido', 'cancelado', 'expirado'],
    default: 'activo'
  },
  fechaCreacion: { type: Date, required: true, default: Date.now },
  fechaExpiracion: { type: Date, required: true },
  fechaVenta: { type: Date },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User' },
  destacado: { type: Boolean, default: false },
  metadata: {
    // Información de display
    nombre: { type: String },
    imagen: { type: String },
    descripcion: { type: String },
    // Información específica
    nivel: { type: Number },
    etapa: { type: Number },  // Etapa de evolución
    rango: { type: String },
    durabilidad: { type: Number },
    usos: { type: Number },
    stats: {
      atk: { type: Number },
      defensa: { type: Number },
      vida: { type: Number }
    }
  }
}, {
  timestamps: true
});

// Índices para búsquedas comunes
ListingSchema.index({ estado: 1, fechaExpiracion: 1 });
ListingSchema.index({ sellerId: 1, estado: 1 });
ListingSchema.index({ type: 1, estado: 1 });
ListingSchema.index({ precio: 1 });

export default mongoose.model<IListing>('Listing', ListingSchema);