import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para Stats, reutilizable
export interface IStats {
  atk: number;
  vida: number;
  defensa: number;
}

// Interfaz para Evolucion
export interface IEvolucion {
  nombre: string;
  etapa: number;
  requisitos: {
    val: number; // Usar Number para consistencia con costes y cálculos
    evo: number;
    nivel: number;
  };
  multiplicador_base: number;
  val_por_nivel_por_etapa: number[];
  stats: IStats;
}

export interface IBaseCharacter extends Document {
  id: string;
  nombre: string;
  imagen: string;
  descripcion_rango: string;
  multiplicador_base: number;
  nivel: number;
  etapa: number;
  val_por_nivel_por_etapa: number[];
  stats: IStats;
  progreso: number;
  ultimoMinado: Date | null;
  evoluciones: IEvolucion[];
}

// Schema para Stats, para reutilización y claridad
const StatsSchema: Schema = new Schema({
  atk: { type: Number, required: true },
  vida: { type: Number, required: true },
  defensa: { type: Number, required: true }
}, { _id: false });

// Schema para Evolucion
const EvolucionSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  etapa: { type: Number, required: true },
  requisitos: {
    val: { type: Number, required: true },
    evo: { type: Number, required: true },
    nivel: { type: Number, required: true }
  },
  multiplicador_base: { type: Number, required: true },
  val_por_nivel_por_etapa: [{ type: Number, required: true }],
  stats: { type: StatsSchema, required: true }
}, { _id: false });

const BaseCharacterSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true }, // `unique` ya crea un índice, pero `index: true` es explícito.
  nombre: { type: String, required: true },
  imagen: { type: String, required: true },
  descripcion_rango: { type: String, required: true },
  multiplicador_base: { type: Number, required: true },
  nivel: { type: Number, required: true },
  etapa: { type: Number, required: true },
  val_por_nivel_por_etapa: [{ type: Number, required: true }],
  stats: { type: StatsSchema, required: true },
  progreso: { type: Number, required: true },
  ultimoMinado: { type: Date, default: null },
  evoluciones: [EvolucionSchema]
}, { versionKey: false });

export default mongoose.model<IBaseCharacter>('BaseCharacter', BaseCharacterSchema, 'base_characters');
