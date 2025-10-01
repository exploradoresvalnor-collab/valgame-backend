import { Schema, model, Document } from 'mongoose';

// Interfaz para las mejoras de estadísticas y XP
export interface IEffectBoost {
  mejora_atk: { min: number; max: number };
  mejora_vida: { min: number; max: number };
  mejora_defensa: { min: number; max: number };
  mejora_xp: number; // Es un multiplicador (ej. 2 para x2)
}

// Interfaz principal del Consumible
export interface IConsumable extends Document {
  nombre: string;
  tipo: 'pocion' | 'alimento' | 'pergamino' | 'fruto_mitico';
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  duracion_efecto_minutos: number; // Duración del buff en minutos
  habilidad_especial: string; // Ej: "Poder -1%"
  efectos: IEffectBoost;
}

// Schema para los efectos
const EffectBoostSchema = new Schema({
  mejora_atk: { 
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  mejora_vida: { 
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  mejora_defensa: { 
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  mejora_xp: { type: Number, default: 1 }
}, { _id: false });


const ConsumableSchema = new Schema<IConsumable>({
  nombre: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ['pocion', 'alimento', 'pergamino', 'fruto_mitico'], required: true },
  rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
  duracion_efecto_minutos: { type: Number, required: true },
  habilidad_especial: { type: String },
  efectos: { type: EffectBoostSchema, required: true }
}, { versionKey: false });

// Conexión con la colección 'consumables' en la base de datos
export default model<IConsumable>('Consumable', ConsumableSchema, 'consumables');