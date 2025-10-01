"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ranking = void 0;
const mongoose_1 = require("mongoose");
const RankingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
    puntos: { type: Number, required: true, min: 0, default: 0 },
    victorias: { type: Number, required: true, min: 0, default: 0 },
    derrotas: { type: Number, required: true, min: 0, default: 0 },
    ultimaPartida: { type: Date, required: true, index: true },
    boletosUsados: { type: Number, required: true, min: 0, default: 0 },
    periodo: { type: String, required: true, index: true }
}, { versionKey: false });
exports.Ranking = (0, mongoose_1.model)('Ranking', RankingSchema, 'ranking');
