"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelHistory = void 0;
const mongoose_1 = require("mongoose");
const LevelHistorySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
    personajeId: { type: String, required: true, index: true },
    nivel: { type: Number, required: true, min: 1, max: 100 },
    fecha: { type: Date, default: Date.now, index: true }
}, { collection: 'level_history', versionKey: false });
exports.LevelHistory = (0, mongoose_1.model)('LevelHistory', LevelHistorySchema);
