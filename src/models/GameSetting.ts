import { Schema, Document, model } from 'mongoose';

export interface IGameSetting extends Document {
  nivel_evolucion_etapa_2: number;
  nivel_evolucion_etapa_3: number;
  val_por_mineria_base: number;
  cooldown_mineria_minutos: number;
  puntos_ranking_por_victoria: number;
  costo_ticket_en_val: number;
  // ...y el resto de campos de tu interfaz...
}

const GameSettingSchema: Schema = new Schema({
  nivel_evolucion_etapa_2: { type: Number, required: true },
  nivel_evolucion_etapa_3: { type: Number, required: true },
  val_por_mineria_base: { type: Number, required: true },
  cooldown_mineria_minutos: { type: Number, required: true },
  puntos_ranking_por_victoria: { type: Number, required: true },
  costo_ticket_en_val: { type: Number, required: true },
  descripcion_ticket: { type: String },
  nivel_maximo_personaje: { type: Number, required: true },
  costo_evo_etapa_2: { type: Map, of: Number },
  costo_evo_etapa_3: { type: Map, of: Number },
  tasa_cambio_usdt: { type: Number },
  // ...y el resto de campos de tu schema...
}, {
  versionKey: false
});

export default model<IGameSetting>('GameSetting', GameSettingSchema, 'game_settings');