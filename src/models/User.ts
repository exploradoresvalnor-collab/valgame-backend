import { Schema, model, Document, Types } from 'mongoose';

// --- INTERFACES ---

// Define la estructura de un personaje, incluyendo los nuevos campos
export interface IPersonaje {
  personajeId: string;
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  nivel: number;
  etapa: 1 | 2 | 3;
  progreso: number;
  stats: { atk: number; vida: number; defensa: number };
  // --- Nuevos campos para Salud y Muerte ---
  saludActual: number;
  saludMaxima: number;
  estado: 'saludable' | 'herido';
  fechaHerido: Date | null;
}

// Interfaz del subdocumento de Mongoose
export interface IPersonajeSubdocument extends IPersonaje, Types.Subdocument {}

// Interfaz principal del Usuario, incluyendo los nuevos campos
export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  // --- Nuevos campos para Verificación de Cuenta ---
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  wallet?: string;
  val: number;
  boletos: number;
  evo: number;
  minadoTotal: number; // Este campo quedará obsoleto en el futuro
  invocaciones: number;
  evoluciones: number;
  boletosDiarios: number;
  ultimoReinicio?: Date;
  personajes: Types.DocumentArray<IPersonajeSubdocument>;
  personajeActivoId?: string;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
}

// --- SCHEMAS ---

const PersonajeSchema = new Schema<IPersonaje>({
    personajeId: { type: String, required: true, index: true },
    rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
    nivel: { type: Number, min: 1, max: 100, default: 1 },
    etapa: { type: Number, enum: [1, 2, 3], default: 1 },
    progreso: { type: Number, min: 0, default: 0 },
    stats: {
      atk: { type: Number, min: 0, default: 0 },
      vida: { type: Number, min: 0, default: 0 },
      defensa: { type: Number, min: 0, default: 0 }
    },
    // --- Definición de los nuevos campos en el Schema ---
    saludActual: { type: Number, default: 100 },
    saludMaxima: { type: Number, default: 100 },
    estado: { type: String, enum: ['saludable', 'herido'], default: 'saludable' },
    fechaHerido: { type: Date, default: null }
  }, { 
    // Aseguramos que cada personaje en el array tenga su propio _id para el Marketplace
    _id: true 
  });

const UserSchema = new Schema<IUser>({
    email: { type: String, unique: true, index: true, required: true },
    username: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    // --- Definición de los nuevos campos en el Schema ---
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    wallet: { type: String },
    val: { type: Number, default: 0, min: 0 },
    boletos: { type: Number, default: 0, min: 0 },
    evo: { type: Number, default: 0, min: 0 },
    minadoTotal: { type: Number, default: 0, min: 0 },
    invocaciones: { type: Number, default: 0, min: 0 },
    evoluciones: { type: Number, default: 0, min: 0 },
    boletosDiarios: { type: Number, default: 0, min: 0, max: 10 },
    ultimoReinicio: { type: Date },
    personajes: { type: [PersonajeSchema], default: [] },
    personajeActivoId: { type: String }
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