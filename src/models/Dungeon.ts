import { Schema, model, Document } from 'mongoose';

// Interfaz para la tabla de recompensas (loot table)
export interface IDrop {
  itemId: string; // ID del Equipment o Consumable
  tipoItem: 'equipment' | 'consumable';
  probabilidad: number; // De 0 a 1
}

// Interfaz principal de la Mazmorra
export interface IDungeon extends Document {
  nombre: string;
  descripcion: string;
  stats: {
    vida: number;
    ataque: number;
    defensa: number;
  };
  probabilidades: {
    fallo_ataque_jugador: number; // De 0 a 1
    fallo_ataque_propio: number; // De 0 a 1
  };
  recompensas: {
    expBase: number;
    dropTable: IDrop[];
  };
}

const DropSchema = new Schema({
  itemId: { type: String, required: true },
  tipoItem: { type: String, enum: ['equipment', 'consumable'], required: true },
  probabilidad: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false });

const DungeonSchema = new Schema<IDungeon>({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  stats: {
    vida: { type: Number, required: true },
    ataque: { type: Number, required: true },
    defensa: { type: Number, required: true },
  },
  probabilidades: {
    fallo_ataque_jugador: { type: Number, required: true, default: 0.15 },
    fallo_ataque_propio: { type: Number, required: true, default: 0.25 },
  },
  recompensas: {
    expBase: { type: Number, required: true },
    dropTable: { type: [DropSchema], required: true },
  }
}, { versionKey: false });

// Conexión con la colección 'dungeons' en la base de datos
export default model<IDungeon>('Dungeon', DungeonSchema, 'dungeons');