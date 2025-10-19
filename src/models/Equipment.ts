import { Schema, model } from 'mongoose';
import { Item, IItem } from './Item'; // Importamos el modelo y la interfaz base

// Interfaz para las estadísticas específicas del equipamiento
export interface IEquipmentStats {
  atk: number;
  defensa: number;
  vida: number;
}

// Interfaz del Equipamiento, extendiendo la de Item
export interface IEquipment extends IItem {
  tipo: 'arma' | 'armadura' | 'escudo' | 'anillo';
  nivel_minimo_requerido: number;
  stats: IEquipmentStats;
  habilidades?: string[];
}

// Schema solo con los campos específicos del equipamiento
const EquipmentSchema = new Schema<IEquipment>({
  tipo: { 
    type: String, 
    enum: ['arma', 'armadura', 'escudo', 'anillo'], 
    required: true 
  },
  nivel_minimo_requerido: { type: Number, default: 1 },
  stats: {
    atk: { type: Number, default: 0 },
    defensa: { type: Number, default: 0 },
    vida: { type: Number, default: 0 }
  },
  habilidades: [{ type: String }]
});

// Creamos el modelo 'Equipment' como un discriminador del modelo 'Item'
// El primer argumento 'Equipment' será el valor del campo 'tipoItem'
export const Equipment = Item.discriminator<IEquipment>('Equipment', EquipmentSchema);
