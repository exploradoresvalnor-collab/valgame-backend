import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPlayerStats extends Document {
  userId: Types.ObjectId; // MEJORA
  personajeId: string;
  fecha: Date;
  valAcumulado: number;
  fuente: string;
}

const PlayerStatsSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
  personajeId: { type: String, required: true, index: true },
  fecha: { type: Date, default: Date.now },
  valAcumulado: { type: Number, required: true },
  fuente: { type: String, required: true }
}, { versionKey: false });

export default mongoose.model<IPlayerStats>('PlayerStats', PlayerStatsSchema, 'playerstats');