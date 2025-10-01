import mongoose, { Schema, Document } from 'mongoose';

export interface ILevelRequirement extends Document {
  nivel: number;
  experiencia_requerida: number;
  experiencia_acumulada: number;
}

const LevelRequirementSchema: Schema = new Schema({
  nivel: { type: Number, required: true, unique: true },
  experiencia_requerida: { type: Number, required: true },
  experiencia_acumulada: { type: Number, required: true }
}, { versionKey: false });

export default mongoose.model<ILevelRequirement>('LevelRequirement', LevelRequirementSchema, 'level_requirements');
