"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GameSettingSchema = new mongoose_1.Schema({
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
        of: new mongoose_1.Schema({
            atk: { type: Number, required: true },
            vida: { type: Number, required: true },
            defensa: { type: Number, required: true }
        }, { _id: false })
    },
    // ...y el resto de campos de tu schema...
}, {
    versionKey: false
});
exports.default = (0, mongoose_1.model)('GameSetting', GameSettingSchema, 'game_settings');
