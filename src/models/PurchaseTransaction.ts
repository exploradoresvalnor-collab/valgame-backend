import { Schema, model, Document, Types } from 'mongoose';

export interface IPurchaseTransaction extends Document {
  userId: Types.ObjectId;
  itemId?: Types.ObjectId;
  paqueteId?: string;
  cantidad: number;
  currency: 'val' | 'boletos';
  totalCostoVal: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const PurchaseTransactionSchema = new Schema<IPurchaseTransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: false },
  paqueteId: { type: String, required: false },
  cantidad: { type: Number, required: true, min: 1, default: 1 },
  currency: { type: String, enum: ['val', 'boletos'], required: true },
  totalCostoVal: { type: Number, required: true, min: 0 },
  timestamp: { type: Date, default: Date.now, index: true },
  metadata: { type: Schema.Types.Mixed }
}, { versionKey: false });

export default model<IPurchaseTransaction>('PurchaseTransaction', PurchaseTransactionSchema, 'purchase_transactions');