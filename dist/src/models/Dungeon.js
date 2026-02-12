"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DropSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item', required: true },
    tipoItem: { type: String, enum: ['Equipment', 'Consumable'], required: true },
    probabilidad: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false });
const DungeonSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    nivel_requerido_minimo: { type: Number, required: true, default: 1 },
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
        valBase: { type: Number, required: true, default: 10 },
        dropTable: { type: [DropSchema], required: true },
    },
    nivel_sistema: {
        multiplicador_stats_por_nivel: { type: Number, required: true, default: 0.15 },
        multiplicador_val_por_nivel: { type: Number, required: true, default: 0.10 },
        multiplicador_xp_por_nivel: { type: Number, required: true, default: 0.10 },
        multiplicador_drop_por_nivel: { type: Number, required: true, default: 0.05 },
        nivel_maximo_recomendado: { type: Number, required: true, default: 50 }
    },
    personajes_exclusivos: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'BaseCharacter' }],
    items_exclusivos: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' }],
    nivel_minimo_para_exclusivos: { type: Number, required: true, default: 20 }
}, { versionKey: false });
// Conexión con la colección 'dungeons' en la base de datos
exports.default = (0, mongoose_1.model)('Dungeon', DungeonSchema, 'dungeons');
