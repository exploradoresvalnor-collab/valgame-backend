import { Schema, model, Document, Types } from 'mongoose';

export interface IRanking extends Document {
  userId: Types.ObjectId; // MEJORA
  puntos: number;
  victorias: number;
  derrotas: number;
  ultimaPartida: Date;
  boletosUsados: number;
  periodo: string;
}

const RankingSchema = new Schema<IRanking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
  puntos: { type: Number, required: true, min: 0, default: 0 },
  victorias: { type: Number, required: true, min: 0, default: 0 },
  derrotas: { type: Number, required: true, min: 0, default: 0 },
  ultimaPartida: { type: Date, required: true, index: true },
  boletosUsados: { type: Number, required: true, min: 0, default: 0 },
  periodo: { type: String, required: true, index: true }
}, { versionKey: false });

export const Ranking = model<IRanking>('Ranking', RankingSchema, 'ranking');