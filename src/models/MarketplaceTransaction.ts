import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketplaceTransaction extends Document {
  // IDs de referencia
  listingId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId?: mongoose.Types.ObjectId; // Opcional porque en 'listed' aún no hay comprador
  
  // Información del item
  itemId: string;
  itemType: 'personaje' | 'equipamiento' | 'consumible' | 'especial';
  
  // Información financiera
  precioOriginal: number;
  precioFinal: number;
  impuesto: number;
  
  // Tipo de acción
  action: 'listed' | 'sold' | 'cancelled' | 'expired';
  
  // Timestamp
  timestamp: Date;
  
  // Metadata del item (snapshot en el momento de la transacción)
  itemMetadata: {
    nombre?: string;
    imagen?: string;
    descripcion?: string;
    rango?: string;
    nivel?: number;
    stats?: {
      atk?: number;
      defensa?: number;
      vida?: number;
    };
  };
  
  // Balance snapshot (para auditoría)
  balanceSnapshot?: {
    sellerBalanceBefore?: number;
    sellerBalanceAfter?: number;
    buyerBalanceBefore?: number;
    buyerBalanceAfter?: number;
  };
  
  // Duración del listing (para analytics)
  listingDuration?: number; // milisegundos
  
  // Metadata adicional para debugging
  metadata?: {
    userAgent?: string;
    ip?: string;
    destacado?: boolean;
    fechaExpiracion?: Date;
  };
}

const MarketplaceTransactionSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  
  itemId: { type: String, required: true, index: true },
  itemType: { 
    type: String, 
    required: true,
    enum: ['personaje', 'equipamiento', 'consumible', 'especial']
  },
  
  precioOriginal: { type: Number, required: true },
  precioFinal: { type: Number, required: true },
  impuesto: { type: Number, required: true },
  
  action: { 
    type: String, 
    required: true,
    enum: ['listed', 'sold', 'cancelled', 'expired'],
    index: true
  },
  
  timestamp: { type: Date, required: true, default: Date.now, index: true },
  
  itemMetadata: {
    nombre: { type: String },
    imagen: { type: String },
    descripcion: { type: String },
    rango: { type: String },
    nivel: { type: Number },
    stats: {
      atk: { type: Number },
      defensa: { type: Number },
      vida: { type: Number }
    }
  },
  
  balanceSnapshot: {
    sellerBalanceBefore: { type: Number },
    sellerBalanceAfter: { type: Number },
    buyerBalanceBefore: { type: Number },
    buyerBalanceAfter: { type: Number }
  },
  
  listingDuration: { type: Number },
  
  metadata: {
    userAgent: { type: String },
    ip: { type: String },
    destacado: { type: Boolean },
    fechaExpiracion: { type: Date }
  }
}, {
  timestamps: true
});

// Índices compuestos para queries comunes
MarketplaceTransactionSchema.index({ sellerId: 1, timestamp: -1 });
MarketplaceTransactionSchema.index({ buyerId: 1, timestamp: -1 });
MarketplaceTransactionSchema.index({ action: 1, timestamp: -1 });
MarketplaceTransactionSchema.index({ itemType: 1, action: 1 });

export default mongoose.model<IMarketplaceTransaction>('MarketplaceTransaction', MarketplaceTransactionSchema);
