import { Schema, model, Document, Types } from 'mongoose';

// Interfaz para requisitos de logro
export interface IAchievementRequirements {
  tipoRequisito: 'combates' | 'victorias' | 'nivel' | 'items' | 'dinero' | 'tiempo' | 'custom';
  valor: number;
  descripcion?: string;
}

// Interfaz para recompensas de logro
export interface IAchievementReward {
  tipo: 'xp' | 'val' | 'badge' | 'titulo';
  valor: number;
  descripcion?: string;
}

// Interfaz principal de Logro
export interface IAchievement extends Document {
  nombre: string;
  descripcion: string;
  categoria: 'combate' | 'exploracion' | 'economia' | 'social' | 'hito' | 'oculto';
  
  // Visual
  icono: string; // URL o nombre del icono
  color?: string; // Color hexadecimal (ej: #FFD700 para oro)
  
  // Requisitos para desbloquear
  requisitos: IAchievementRequirements[];
  
  // Recompensas al desbloquear
  recompensas: IAchievementReward[];
  
  // Metadatos
  dificultad: 'facil' | 'normal' | 'dificil' | 'legendaria';
  oculto: boolean; // Si es true, no se muestra hasta desbloquearlo
  seccion: string; // Agrupación (ej: "Primeros Pasos", "Guerrero Legendario")
  
  // Rastreo
  activo: boolean; // Si está habilitado
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    categoria: {
      type: String,
      enum: ['combate', 'exploracion', 'economia', 'social', 'hito', 'oculto'],
      default: 'hito'
    },
    icono: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#FFFFFF',
      match: /^#[0-9A-F]{6}$/i // Validar color hexadecimal
    },
    requisitos: [
      {
        tipoRequisito: {
          type: String,
          enum: ['combates', 'victorias', 'nivel', 'items', 'dinero', 'tiempo', 'custom'],
          required: true
        },
        valor: {
          type: Number,
          required: true,
          min: 1
        },
        descripcion: {
          type: String,
          trim: true
        }
      }
    ],
    recompensas: [
      {
        tipo: {
          type: String,
          enum: ['xp', 'val', 'badge', 'titulo'],
          required: true
        },
        valor: {
          type: Number,
          required: true,
          min: 0
        },
        descripcion: {
          type: String,
          trim: true
        }
      }
    ],
    dificultad: {
      type: String,
      enum: ['facil', 'normal', 'dificil', 'legendaria'],
      default: 'normal'
    },
    oculto: {
      type: Boolean,
      default: false
    },
    seccion: {
      type: String,
      default: 'Misceláneos',
      trim: true
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'achievements'
  }
);

// Índices para búsquedas rápidas
AchievementSchema.index({ categoria: 1 });
AchievementSchema.index({ activo: 1 });
AchievementSchema.index({ seccion: 1 });
AchievementSchema.index({ dificultad: 1 });

export const Achievement = model<IAchievement>('Achievement', AchievementSchema);
export default Achievement;
