import { Schema, model, Document, Types } from 'mongoose';

export interface IActiveBuff {
  consumableId: Types.ObjectId;
  effects: {
    mejora_atk?: number;
    mejora_defensa?: number;
    mejora_vida?: number;
    mejora_xp_porcentaje?: number;
  };
  expiresAt: Date;
}

export interface IUserCharacter extends Document {
  userId: Types.ObjectId;
  personajeId: string;
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  nivel: number;
  etapa: 1 | 2 | 3;
  progreso: number;
  experiencia: number;
  stats: { atk: number; vida: number; defensa: number; };
  saludActual: number;
  saludMaxima: number;
  estado: 'saludable' | 'herido';
  fechaHerido: Date | null;
  equipamiento: Types.ObjectId[];
  activeBuffs: IActiveBuff[];
}

const ActiveBuffSchema = new Schema({
  consumableId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  effects: {
    mejora_atk: { type: Number },
    mejora_defensa: { type: Number },
    mejora_vida: { type: Number },
    mejora_xp_porcentaje: { type: Number }
  },
  expiresAt: { type: Date, required: true }
}, { _id: false });

const UserCharacterSchema = new Schema<IUserCharacter>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  personajeId: { type: String, required: true, index: true },
  rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
  nivel: { type: Number, min: 1, max: 100, default: 1 },
  etapa: { type: Number, enum: [1, 2, 3], default: 1 },
  progreso: { type: Number, min: 0, default: 0 },
  experiencia: { type: Number, min: 0, default: 0 },
  stats: {
    atk: { type: Number, min: 0, default: 0 },
    vida: { type: Number, min: 0, default: 0 },
    defensa: { type: Number, min: 0, default: 0 }
  },
  saludActual: { type: Number, default: 100 },
  saludMaxima: { type: Number, default: 100 },
  estado: { type: String, enum: ['saludable', 'herido'], default: 'saludable' },
  fechaHerido: { type: Date, default: null },
  equipamiento: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  activeBuffs: { type: [ActiveBuffSchema], default: [] }
}, {
  timestamps: true
});

// Index for frequently querying alive status or characters by user
UserCharacterSchema.index({ userId: 1, estado: 1 });

export default model<IUserCharacter>('UserCharacter', UserCharacterSchema);