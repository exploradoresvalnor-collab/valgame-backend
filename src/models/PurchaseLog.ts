import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchaseLog extends Document {
  userId: Types.ObjectId;
  packageId: Types.ObjectId;
  action: 'purchase' | 'open';
  valSpent?: number;
  itemsReceived?: Types.ObjectId[];
  charactersReceived?: string[];
  valReceived?: number;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  // Metadata adicional para debugging
  metadata?: {
    currentCharacters?: number;
    currentItems?: number;
    currentVal?: number;
    packageName?: string;
    packagePrice?: number;
  };
}

const PurchaseLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  action: { 
    type: String, 
    enum: ['purchase', 'open'], 
    required: true,
    index: true 
  },
  valSpent: { type: Number, min: 0 },
  itemsReceived: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  charactersReceived: [{ type: String }],
  valReceived: { type: Number, min: 0 },
  timestamp: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { 
  versionKey: false,
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índice compuesto para queries comunes
PurchaseLogSchema.index({ userId: 1, timestamp: -1 });
PurchaseLogSchema.index({ action: 1, timestamp: -1 });

export default mongoose.model<IPurchaseLog>('PurchaseLog', PurchaseLogSchema, 'purchase_logs');
