import { Schema, model, Document, Types } from 'mongoose';

export interface ILevelHistory extends Document {
  userId: Types.ObjectId;
  personajeId: string;
  nivel: number;
  experienciaTotal: number;
  experienciaAnterior: number;
  experienciaNueva: number;
  statsAnteriores: {
    atk: number;
    defensa: number;
    vida: number;
  };
  statsNuevos: {
    atk: number;
    defensa: number;
    vida: number;
  };
  fecha: Date;
}

const LevelHistorySchema = new Schema<ILevelHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  personajeId: { type: String, required: true, index: true },
  nivel: { type: Number, required: true, min: 1, max: 100 },
  experienciaTotal: { type: Number, required: true },
  experienciaAnterior: { type: Number, required: true },
  experienciaNueva: { type: Number, required: true },
  statsAnteriores: {
    atk: { type: Number, required: true },
    defensa: { type: Number, required: true },
    vida: { type: Number, required: true }
  },
  statsNuevos: {
    atk: { type: Number, required: true },
    defensa: { type: Number, required: true },
    vida: { type: Number, required: true }
  },
  fecha: { type: Date, default: Date.now, index: true }
}, { 
  versionKey: false,
  collection: 'level_histories' // Historial de niveles de los personajes
});

export const LevelHistory = model<ILevelHistory>('LevelHistory', LevelHistorySchema);