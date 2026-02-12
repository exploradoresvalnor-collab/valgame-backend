"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Achievement = void 0;
const mongoose_1 = require("mongoose");
const AchievementSchema = new mongoose_1.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    descripcion: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    categoria: {
        type: String,
        enum: ['combate', 'exploracion', 'economia', 'social', 'hito', 'oculto'],
        default: 'hito'
    },
    icono: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#FFFFFF',
        match: /^#[0-9A-F]{6}$/i // Validar color hexadecimal
    },
    requisitos: [
        {
            tipoRequisito: {
                type: String,
                enum: ['combates', 'victorias', 'nivel', 'items', 'dinero', 'tiempo', 'custom'],
                required: true
            },
            valor: {
                type: Number,
                required: true,
                min: 1
            },
            descripcion: {
                type: String,
                trim: true
            }
        }
    ],
    recompensas: [
        {
            tipo: {
                type: String,
                enum: ['xp', 'val', 'badge', 'titulo'],
                required: true
            },
            valor: {
                type: Number,
                required: true,
                min: 0
            },
            descripcion: {
                type: String,
                trim: true
            }
        }
    ],
    dificultad: {
        type: String,
        enum: ['facil', 'normal', 'dificil', 'legendaria'],
        default: 'normal'
    },
    oculto: {
        type: Boolean,
        default: false
    },
    seccion: {
        type: String,
        default: 'Misceláneos',
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'achievements'
});
// Índices para búsquedas rápidas
AchievementSchema.index({ categoria: 1 });
AchievementSchema.index({ activo: 1 });
AchievementSchema.index({ seccion: 1 });
AchievementSchema.index({ dificultad: 1 });
exports.Achievement = (0, mongoose_1.model)('Achievement', AchievementSchema);
exports.default = exports.Achievement;
