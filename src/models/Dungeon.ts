import { Schema, model, Document, Types } from 'mongoose';

// Interfaz para la tabla de recompensas (loot table)
export interface IDrop {
  itemId: Types.ObjectId; // ID de un item en la colección 'items'
  tipoItem: 'Equipment' | 'Consumable'; // El modelo del item
  probabilidad: number; // De 0 a 1
}

// Interfaz principal de la Mazmorra
export interface IDungeon extends Document {
  nombre: string;
  descripcion: string;
  nivel_requerido_minimo: number; // Nivel mínimo del personaje para entrar
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
    valBase: number; // VAL base que da la mazmorra (BAJO para mantener economía)
    dropTable: IDrop[];
  };
  // Sistema de niveles progresivos
  nivel_sistema: {
    multiplicador_stats_por_nivel: number;  // Ej: 0.15 = +15% stats por nivel
    multiplicador_val_por_nivel: number;    // Ej: 0.10 = +10% VAL por nivel
    multiplicador_xp_por_nivel: number;     // Ej: 0.10 = +10% XP por nivel
    multiplicador_drop_por_nivel: number;   // Ej: 0.05 = +5% probabilidad por nivel (máx 2x)
    nivel_maximo_recomendado: number;       // Nivel sugerido máximo (ej: 50, pero puede subir infinito)
  };
  // Items y personajes exclusivos
  personajes_exclusivos?: Types.ObjectId[]; // Personajes que SOLO dropean aquí
  items_exclusivos?: Types.ObjectId[];      // Items que SOLO dropean aquí
  nivel_minimo_para_exclusivos: number;     // Nivel de mazmorra para drops exclusivos
}

const DropSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  tipoItem: { type: String, enum: ['Equipment', 'Consumable'], required: true },
  probabilidad: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false });

const DungeonSchema = new Schema<IDungeon>({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  nivel_requerido_minimo: { type: Number, required: true, default: 1 },
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
    valBase: { type: Number, required: true, default: 10 },
    dropTable: { type: [DropSchema], required: true },
  },
  nivel_sistema: {
    multiplicador_stats_por_nivel: { type: Number, required: true, default: 0.15 },
    multiplicador_val_por_nivel: { type: Number, required: true, default: 0.10 },
    multiplicador_xp_por_nivel: { type: Number, required: true, default: 0.10 },
    multiplicador_drop_por_nivel: { type: Number, required: true, default: 0.05 },
    nivel_maximo_recomendado: { type: Number, required: true, default: 50 }
  },
  personajes_exclusivos: [{ type: Schema.Types.ObjectId, ref: 'BaseCharacter' }],
  items_exclusivos: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  nivel_minimo_para_exclusivos: { type: Number, required: true, default: 20 }
}, { versionKey: false });

// Conexión con la colección 'dungeons' en la base de datos
export default model<IDungeon>('Dungeon', DungeonSchema, 'dungeons');
