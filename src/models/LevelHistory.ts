import { Schema, model, Document, Types } from 'mongoose';

export interface ILevelHistory extends Document {
  userId: Types.ObjectId; // MEJORA
  personajeId: string;
  nivel: number;
  fecha: Date;
}

const LevelHistorySchema = new Schema<ILevelHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
  personajeId: { type: String, required: true, index: true },
  nivel: { type: Number, required: true, min: 1, max: 100 },
  fecha: { type: Date, default: Date.now, index: true }
}, { collection: 'level_history', versionKey: false });

export const LevelHistory = model<ILevelHistory>('LevelHistory', LevelHistorySchema);