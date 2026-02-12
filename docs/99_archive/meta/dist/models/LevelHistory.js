"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelHistory = void 0;
const mongoose_1 = require("mongoose");
const LevelHistorySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    personajeId: { type: String, required: true, index: true },
    nivel: { type: Number, required: true, min: 1, max: 100 },
    experienciaTotal: { type: Number, required: true },
    experienciaAnterior: { type: Number, required: true },
    experienciaNueva: { type: Number, required: true },
    statsAnteriores: {
        atk: { type: Number, required: true },
        defensa: { type: Number, required: true },
        vida: { type: Number, required: true }
    },
    statsNuevos: {
        atk: { type: Number, required: true },
        defensa: { type: Number, required: true },
        vida: { type: Number, required: true }
    },
    fecha: { type: Date, default: Date.now, index: true }
}, {
    versionKey: false,
    collection: 'level_histories' // Historial de niveles de los personajes
});
exports.LevelHistory = (0, mongoose_1.model)('LevelHistory', LevelHistorySchema);
