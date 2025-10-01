"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schema para los efectos
const EffectBoostSchema = new mongoose_1.Schema({
    mejora_atk: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    mejora_vida: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    mejora_defensa: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    mejora_xp: { type: Number, default: 1 }
}, { _id: false });
const ConsumableSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, unique: true },
    tipo: { type: String, enum: ['pocion', 'alimento', 'pergamino', 'fruto_mitico'], required: true },
    rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
    duracion_efecto_minutos: { type: Number, required: true },
    habilidad_especial: { type: String },
    efectos: { type: EffectBoostSchema, required: true }
}, { versionKey: false });
// Conexión con la colección 'consumables' en la base de datos
exports.default = (0, mongoose_1.model)('Consumable', ConsumableSchema, 'consumables');
