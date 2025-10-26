import { Schema } from 'mongoose';

// Interfaz para la configuración del usuario
export interface IUserSettings {
  musicVolume: number; // 0-100
  sfxVolume: number; // 0-100
  language: 'es' | 'en'; // Idiomas soportados
  notificationsEnabled: boolean;
}

// Schema embebido (subdocumento) para las configuraciones del usuario
export const UserSettingsSchema = new Schema<IUserSettings>({
  musicVolume: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  sfxVolume: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  language: {
    type: String,
    enum: ['es', 'en'],
    default: 'es'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  }
}, { _id: false }); // No necesita _id propio ya que es un subdocumento embebido
