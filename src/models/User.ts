import { Schema, model, Document, Types } from 'mongoose';
import { IUserSettings, UserSettingsSchema } from './UserSettings';

// --- INTERFACES ---

// Define la estructura de un personaje, incluyendo los nuevos campos
export interface IPersonaje {
  personajeId: string;
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  nivel: number;
  etapa: 1 | 2 | 3;
  progreso: number;
  experiencia: number;
  stats: { atk: number; vida: number; defensa: number };
  // --- Nuevos campos para Salud y Muerte ---
  saludActual: number;
  saludMaxima: number;
  estado: 'saludable' | 'herido';
  fechaHerido: Date | null;
  equipamiento: Types.ObjectId[]; // Array de IDs de Items (con tipoItem: 'Equipment')
  activeBuffs: IActiveBuff[]; // Array de buffs activos
}

// Interfaz del subdocumento de Mongoose
export interface IPersonajeSubdocument extends IPersonaje, Types.Subdocument {}

// --- NUEVO: Interfaz para Buffs Activos ---
export interface IActiveBuff {
  consumableId: Types.ObjectId;
  effects: {
    mejora_atk?: number;
    mejora_defensa?: number;
    mejora_vida?: number;
    mejora_xp_porcentaje?: number; // <-- AÑADIDO
  };
  expiresAt: Date;
}

// Interfaz para el subdocumento de inventario de consumibles
export interface IConsumableItem {
  consumableId: Types.ObjectId; // Referencia a un item en la colección 'items'
  usos_restantes: number;
}
export interface IConsumableItemSubdocument extends IConsumableItem, Types.Subdocument {}

// Interfaz principal del Usuario, incluyendo el inventario
export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  walletAddress?: string;
  val: number;
  boletos: number;
  evo: number;
  invocaciones: number;
  evoluciones: number;
  boletosDiarios: number;
  ultimoReinicio?: Date;
  personajes: Types.DocumentArray<IPersonajeSubdocument>;
  inventarioEquipamiento: Types.ObjectId[];
  inventarioConsumibles: Types.DocumentArray<IConsumableItemSubdocument>;
  limiteInventarioEquipamiento: number;
  limiteInventarioConsumibles: number;
  limiteInventarioPersonajes: number;
  personajeActivoId?: string;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  // Flag para indicar si el usuario ya recibió el Paquete del Pionero
  receivedPioneerPackage?: boolean;
  
  // Configuración del usuario (volumen, idioma, notificaciones)
  settings: IUserSettings;
  
  // Progreso de mazmorras por usuario
  dungeon_progress?: Map<string, {
    victorias: number;
    derrotas: number;
    nivel_actual: number;
    puntos_acumulados: number;
    puntos_requeridos_siguiente_nivel: number;
    mejor_tiempo: number;
    ultima_victoria?: Date;
  }>;
  dungeon_streak: number;
  max_dungeon_streak: number;
  dungeon_stats: {
    total_victorias: number;
    total_derrotas: number;
    mejor_racha: number;
  };
}

// --- SCHEMAS ---

// --- NUEVO: Schema para Buffs Activos ---
const ActiveBuffSchema = new Schema({
  consumableId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  effects: {
    mejora_atk: { type: Number },
    mejora_defensa: { type: Number },
    mejora_vida: { type: Number },
    mejora_xp_porcentaje: { type: Number } // <-- AÑADIDO
  },
  expiresAt: { type: Date, required: true }
}, { _id: false });

const PersonajeSchema = new Schema<IPersonaje>({
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
    // La referencia ahora apunta a 'Item', ya que 'Equipment' es un tipo de 'Item'
    equipamiento: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    activeBuffs: { type: [ActiveBuffSchema], default: [] }
  }, { 
    _id: true 
  });

// Schema para el inventario de consumibles
const ConsumableItemSchema = new Schema<IConsumableItem>({
  consumableId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Consumable'
  },
  usos_restantes: { type: Number, required: true, min: 0 }
}, { _id: true }); // _id: true para que cada instancia sea única

const UserSchema = new Schema<IUser>({
    email: { type: String, unique: true, index: true, required: true },
    username: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    walletAddress: { type: String, unique: true, sparse: true },
    val: { type: Number, default: 0, min: 0 },
    boletos: { type: Number, default: 0, min: 0 },
    evo: { type: Number, default: 0, min: 0 },
    invocaciones: { type: Number, default: 0, min: 0 },
    evoluciones: { type: Number, default: 0, min: 0 },
    boletosDiarios: { type: Number, default: 0, min: 0, max: 10 },
    ultimoReinicio: { type: Date },
    personajes: { type: [PersonajeSchema], default: [] },
    inventarioEquipamiento: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    inventarioConsumibles: { type: [ConsumableItemSchema], default: [] },
    limiteInventarioEquipamiento: { type: Number, default: 20 },
    limiteInventarioConsumibles: { type: Number, default: 50 },
    limiteInventarioPersonajes: { type: Number, default: 50 },
    personajeActivoId: { type: String }
    ,
    // Flag para indicar si el usuario ya recibió el Paquete del Pionero
    receivedPioneerPackage: { type: Boolean, default: false },
    
    // Configuración del usuario (subdocumento embebido)
    settings: { type: UserSettingsSchema, default: () => ({}) },
    
    // Progreso de mazmorras por usuario (Map<dungeonId, progressData>)
    dungeon_progress: { 
      type: Map, 
      of: new Schema({
        victorias: { type: Number, default: 0, min: 0 },
        derrotas: { type: Number, default: 0, min: 0 },
        nivel_actual: { type: Number, default: 1, min: 1 },
        puntos_acumulados: { type: Number, default: 0, min: 0 },
        puntos_requeridos_siguiente_nivel: { type: Number, default: 100, min: 1 },
        mejor_tiempo: { type: Number, default: 0, min: 0 }, // en segundos
        ultima_victoria: { type: Date }
      }, { _id: false }),
      default: () => new Map()
    },
    dungeon_streak: { type: Number, default: 0, min: 0 },
    max_dungeon_streak: { type: Number, default: 0, min: 0 },
    dungeon_stats: {
      type: new Schema({
        total_victorias: { type: Number, default: 0, min: 0 },
        total_derrotas: { type: Number, default: 0, min: 0 },
        mejor_racha: { type: Number, default: 0, min: 0 }
      }, { _id: false }),
      default: () => ({ total_victorias: 0, total_derrotas: 0, mejor_racha: 0 })
    }
  }, {
    timestamps: { createdAt: 'fechaRegistro', updatedAt: 'ultimaActualizacion' },
    versionKey: false
  });

// La función toJSON para seguridad se mantiene igual
UserSchema.set('toJSON', {
  transform: (document: any, returnedObject: any) => {
    if (returnedObject && returnedObject._id != null) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
    }
    if (returnedObject && 'passwordHash' in returnedObject) {
      delete returnedObject.passwordHash;
    }
  }
});

// Exportación correcta del modelo apuntando a la colección 'users'
export const User = model<IUser>('User', UserSchema, 'users');