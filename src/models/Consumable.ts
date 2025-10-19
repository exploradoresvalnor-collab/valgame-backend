import { Schema } from 'mongoose';
import { Item, IItem } from './Item'; // Importamos el modelo y la interfaz base

// Interfaz para los efectos específicos de un consumible
export interface IConsumableEffects {
  mejora_atk?: number;
  mejora_defensa?: number;
  mejora_vida?: number;
  mejora_xp_porcentaje?: number; // Bonus de XP en porcentaje
}

// Interfaz del Consumible, extendiendo la de Item
export interface IConsumable extends IItem {
  tipo: 'pocion' | 'alimento' | 'pergamino' | 'fruto_mitico';
  usos_maximos?: number;
  duracion_efecto_minutos?: number; // Opcional, no todos tienen duración
  efectos: IConsumableEffects;
}

// Schema solo con los campos específicos del consumible
const ConsumableSchema = new Schema<IConsumable>({
  tipo: { 
    type: String, 
    enum: ['pocion', 'alimento', 'pergamino', 'fruto_mitico'], 
    required: true 
  },
  usos_maximos: { type: Number, default: 1 }, // Campo para los usos del consumible
  duracion_efecto_minutos: { type: Number },
  efectos: {
    mejora_atk: { type: Number, default: 0 },
    mejora_defensa: { type: Number, default: 0 },
    mejora_vida: { type: Number, default: 0 },
    mejora_xp_porcentaje: { type: Number, default: 0 }
  }
});

// Creamos el modelo 'Consumable' como un discriminador del modelo 'Item'
// El primer argumento 'Consumable' será el valor del campo 'tipoItem'
export const Consumable = Item.discriminator<IConsumable>('Consumable', ConsumableSchema);
