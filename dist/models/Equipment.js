"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schema para las mejoras, para mantener la estructura limpia
const StatBoostSchema = new mongoose_1.Schema({
    mejora_atk: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    mejora_vida: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    mejora_defensa: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
}, { _id: false });
const EquipmentSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, unique: true },
    tipo: { type: String, enum: ['arma', 'armadura', 'escudo', 'anillo'], required: true },
    rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
    tasa_aparicion: { type: Number, required: true },
    nivel_minimo_requerido: { type: Number, required: true },
    habilidades: [{ type: String }],
    stats: { type: StatBoostSchema, required: true }
}, { versionKey: false });
// Conexión con la colección 'equipment' en la base de datos
exports.default = (0, mongoose_1.model)('Equipment', EquipmentSchema, 'equipment');
