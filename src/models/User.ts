import { Schema, model, Document, Types } from 'mongoose';
import { IUserSettings, UserSettingsSchema } from './UserSettings';

// --- INTERFACES ---

// --- NUEVO: Interfaz para Buffs Activos movida a UserCharacter ---
// (Solo dejamos lo referente a consumibles aquí o items generales)

// Interfaz para el subdocumento de inventario de consumibles
export interface IConsumableItem {
  consumableId: Types.ObjectId; // Referencia a un item en la colección 'items'
  usos_restantes: number;
}
export interface IConsumableItemSubdocument extends IConsumableItem, Types.Subdocument { }

// Interfaz principal del Usuario, incluyendo el inventario
export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  walletAddress?: string;
  val: number;
  boletos: number;
  energia: number;
  energiaMaxima: number;
  ultimoReinicioEnergia?: Date;
  evo: number;
  invocaciones: number;
  evoluciones: number;
  boletosDiarios: number;
  ultimoReinicio?: Date;
  personajesId: Types.ObjectId[];
  inventarioEquipamiento: Types.ObjectId[];
  inventarioConsumibles: Types.DocumentArray<IConsumableItemSubdocument>;
  limiteInventarioEquipamiento: number;
  limiteInventarioConsumibles: number;
  limiteInventarioPersonajes: number;
  personajeActivoId?: string;
  equipoActivoId?: Types.ObjectId; // <-- NUEVO: ID del equipo activo
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  // Flag para indicar si el usuario ya recibió el Paquete del Pionero
  receivedPioneerPackage?: boolean;

  // Flag para indicar si el usuario completó el tutorial (FTUE)
  tutorialCompleted?: boolean;

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

  // Survival Oleadas
  survivalPoints: number;
  currentSurvivalSession?: Types.ObjectId;
  survivalStats?: {
    totalRuns: number;
    maxWave: number;
    totalPoints: number;
    averageWave: number;
  };

  // Logros desbloqueados
  logros_desbloqueados?: Array<{
    achievementId: Types.ObjectId;
    fechaDesbloqueo: Date;
  }>;
}

// --- SCHEMAS ---

// (Buff schema y PersonajeSchema movidos a UserCharacter.ts)

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
  resetPasswordToken: { type: String },
  resetPasswordTokenExpires: { type: Date },
  walletAddress: { type: String, unique: true, sparse: true },
  val: { type: Number, default: 0, min: 0 },
  boletos: { type: Number, default: 0, min: 0 },
  energia: { type: Number, default: 100, min: 0 },
  energiaMaxima: { type: Number, default: 100, min: 1 },
  ultimoReinicioEnergia: { type: Date },
  evo: { type: Number, default: 0, min: 0 },
  invocaciones: { type: Number, default: 0, min: 0 },
  evoluciones: { type: Number, default: 0, min: 0 },
  boletosDiarios: { type: Number, default: 0, min: 0, max: 10 },
  ultimoReinicio: { type: Date },
  personajesId: [{ type: Schema.Types.ObjectId, ref: 'UserCharacter' }],
  inventarioEquipamiento: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  inventarioConsumibles: { type: [ConsumableItemSchema], default: [] },
  limiteInventarioEquipamiento: { type: Number, default: 20 },
  limiteInventarioConsumibles: { type: Number, default: 50 },
  limiteInventarioPersonajes: { type: Number, default: 50 },
  personajeActivoId: { type: String },
  equipoActivoId: { type: Schema.Types.ObjectId, ref: 'Team' }, // <-- NUEVO: ID del equipo activo
  // Flag para indicar si el usuario ya recibió el Paquete del Pionero
  receivedPioneerPackage: { type: Boolean, default: false },

  // Flag para indicar si el usuario completó el tutorial (FTUE)
  tutorialCompleted: { type: Boolean, default: false },

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
  },
  survivalPoints: { type: Number, default: 0, min: 0 },
  currentSurvivalSession: { type: Schema.Types.ObjectId, ref: 'SurvivalSession', default: null },
  survivalStats: {
    type: new Schema({
      totalRuns: { type: Number, default: 0, min: 0 },
      maxWave: { type: Number, default: 0, min: 0 },
      totalPoints: { type: Number, default: 0, min: 0 },
      averageWave: { type: Number, default: 0, min: 0 }
    }, { _id: false }),
    default: () => ({ totalRuns: 0, maxWave: 0, totalPoints: 0, averageWave: 0 })
  },
  // Logros desbloqueados del usuario
  logros_desbloqueados: [
    {
      achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
      fechaDesbloqueo: { type: Date, default: Date.now }
    }
  ]
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