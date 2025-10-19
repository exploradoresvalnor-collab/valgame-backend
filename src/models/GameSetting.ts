import { Schema, Document, model } from 'mongoose';

// Interfaz para el aumento de stats por rango
interface IStatIncrease {
  atk: number;
  vida: number;
  defensa: number;
}

export interface IGameSetting extends Document {
  nivel_evolucion_etapa_2: number;
  nivel_evolucion_etapa_3: number;
  puntos_ranking_por_victoria: number;
  costo_ticket_en_val: number;
  MAX_PERSONAJES_POR_EQUIPO: number;
  EXP_GLOBAL_MULTIPLIER: number;
  aumento_stats_por_nivel: { [key: string]: IStatIncrease };
  costo_revivir_personaje: number;
  nivel_maximo_personaje: number;
  PERMADEATH_TIMER_HOURS: number;
  // ...y el resto de campos de tu interfaz...
}

const GameSettingSchema: Schema = new Schema({
  nivel_evolucion_etapa_2: { type: Number, required: true },
  nivel_evolucion_etapa_3: { type: Number, required: true },
  puntos_ranking_por_victoria: { type: Number, required: true },
  costo_ticket_en_val: { type: Number, required: true },
  descripcion_ticket: { type: String },
  nivel_maximo_personaje: { type: Number, required: true },
  costo_evo_etapa_2: { type: Map, of: Number },
  costo_evo_etapa_3: { type: Map, of: Number },
  tasa_cambio_usdt: { type: Number },
  MAX_PERSONAJES_POR_EQUIPO: { type: Number, required: true, default: 3 },
  EXP_GLOBAL_MULTIPLIER: { type: Number, required: true, default: 1 },
  costo_revivir_personaje: { type: Number, required: true, default: 50 },
  PERMADEATH_TIMER_HOURS: { type: Number, required: true, default: 24 }, // <-- AÑADIDO // <-- NUEVO
  aumento_stats_por_nivel: {
    type: Map,
    of: new Schema({
      atk: { type: Number, required: true },
      vida: { type: Number, required: true },
      defensa: { type: Number, required: true }
    }, { _id: false })
  },
  // ...y el resto de campos de tu schema...
}, {
  versionKey: false
});

export default model<IGameSetting>('GameSetting', GameSettingSchema, 'game_settings');