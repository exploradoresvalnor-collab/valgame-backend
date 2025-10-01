"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GameSettingSchema = new mongoose_1.Schema({
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
exports.default = (0, mongoose_1.model)('GameSetting', GameSettingSchema, 'game_settings');
