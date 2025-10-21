import { Schema, model, Document, Types } from 'mongoose';

export interface IPurchase extends Document {
  userId: Types.ObjectId; // MEJORA
  paqueteId: string;
  valorPagadoUSDT: number;
  valRecibido: number;
  fechaCompra: Date;
  personajesOtorgados: Array<{
    personajeId: string;
    rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  }>;
  // Campos de reconciliación / integraciones de pago
  externalPaymentId?: string; // id del pago en el proveedor (Bold/Stripe/otro)
  paymentProvider?: string; // ejemplo: 'bold', 'stripe', 'onchain'
  paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'refunded';
  onchainTxHash?: string; // si es pago on-chain
}

const PersonajeOtorgadoSchema = new Schema({
  personajeId: { type: String, required: true },
  rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true }
}, { _id: false });

const PurchaseSchema = new Schema<IPurchase>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
  paqueteId: { type: String, required: true, index: true },
  valorPagadoUSDT: { type: Number, required: true, min: 0 },
  valRecibido: { type: Number, required: true, min: 0 },
  fechaCompra: { type: Date, default: Date.now, index: true },
  personajesOtorgados: { type: [PersonajeOtorgadoSchema], default: [] }
  ,
  externalPaymentId: { type: String, required: false, index: true },
  paymentProvider: { type: String, required: false },
  paymentStatus: { type: String, enum: ['pending','succeeded','failed','refunded'], default: 'pending' },
  onchainTxHash: { type: String, required: false }
},{ versionKey: false });

export const Purchase = model<IPurchase>('Purchase', PurchaseSchema, 'purchases');