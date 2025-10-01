import { Schema, model, Document } from 'mongoose';

// Interfaz para las mejoras de estadísticas
export interface IStatBoost {
  mejora_atk: { min: number; max: number };
  mejora_vida: { min: number; max: number };
  mejora_defensa: { min: number; max: number };
}

// Interfaz principal del Equipamiento
export interface IEquipment extends Document {
  nombre: string;
  tipo: 'arma' | 'armadura' | 'escudo' | 'anillo'; // Para diferenciar el equipamiento
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  tasa_aparicion: number; // Probabilidad de drop
  nivel_minimo_requerido: number;
  habilidades: string[]; // Lista de posibles habilidades pasivas
  stats: IStatBoost; // El rango de mejora que otorga
}

// Schema para las mejoras, para mantener la estructura limpia
const StatBoostSchema = new Schema({
  mejora_atk: { 
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  mejora_vida: { 
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  mejora_defensa: { 
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
}, { _id: false });


const EquipmentSchema = new Schema<IEquipment>({
  nombre: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ['arma', 'armadura', 'escudo', 'anillo'], required: true },
  rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
  tasa_aparicion: { type: Number, required: true },
  nivel_minimo_requerido: { type: Number, required: true },
  habilidades: [{ type: String }],
  stats: { type: StatBoostSchema, required: true }
}, { versionKey: false });

// Conexión con la colección 'equipment' en la base de datos
export default model<IEquipment>('Equipment', EquipmentSchema, 'equipment');