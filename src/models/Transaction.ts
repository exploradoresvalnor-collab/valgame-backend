import { Schema, model, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  tipo: 'compra' | 'recompensa' | 'minado' | 'uso' | 'evolucion' | 'evento';
  item: 'VAL' | 'Boleto' | 'Evo' | 'experiencia';
  cantidad: number;
  fecha: Date;
  descripcion: string;
  referenciaId?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tipo: { type: String, enum: ['compra', 'recompensa', 'minado', 'uso', 'evolucion', 'evento'], required: true },
  item: { type: String, enum: ['VAL', 'Boleto', 'Evo', 'experiencia'], required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now, index: true },
  descripcion: { type: String, required: true },
  referenciaId: { type: String }
}, { 
    versionKey: false,
    collection: 'transactions' // Nombre estándar en inglés
});

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);