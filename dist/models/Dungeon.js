"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DropSchema = new mongoose_1.Schema({
    itemId: { type: String, required: true },
    tipoItem: { type: String, enum: ['equipment', 'consumable'], required: true },
    probabilidad: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false });
const DungeonSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    stats: {
        vida: { type: Number, required: true },
        ataque: { type: Number, required: true },
        defensa: { type: Number, required: true },
    },
    probabilidades: {
        fallo_ataque_jugador: { type: Number, required: true, default: 0.15 },
        fallo_ataque_propio: { type: Number, required: true, default: 0.25 },
    },
    recompensas: {
        expBase: { type: Number, required: true },
        dropTable: { type: [DropSchema], required: true },
    }
}, { versionKey: false });
// Conexión con la colección 'dungeons' en la base de datos
exports.default = (0, mongoose_1.model)('Dungeon', DungeonSchema, 'dungeons');
