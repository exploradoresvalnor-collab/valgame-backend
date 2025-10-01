import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  nombre: string;
  descripcion: string;
  multiplicador_minado: number;
  probabilidad: number;
}

const CategorySchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  multiplicador_minado: { type: Number, required: true },
  probabilidad: { type: Number, required: true }
}, { versionKey: false });

export default mongoose.model<ICategory>('Category', CategorySchema, 'categorias');
