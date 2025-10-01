import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  id: string;
  nombre: string;
  descripcion: string;
  inicio: Date;
  fin: Date;
  recompensas: Array<{
    item: string;
    cantidad: number;
    condicion: string;
  }>;
}

const EventSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  inicio: { type: Date, required: true },
  fin: { type: Date, required: true },
  recompensas: [
    {
      item: { type: String, required: true },
      cantidad: { type: Number, required: true },
      condicion: { type: String, required: true }
    }
  ]
}, { versionKey: false });

export default mongoose.model<IEvent>('Event', EventSchema, 'events');
