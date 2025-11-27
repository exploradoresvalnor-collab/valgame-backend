"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const mongoose_1 = require("mongoose");
const TeamSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    characters: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User.characters', // Referencia a subdocumento
            required: true
        }],
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});
// Índices para rendimiento
TeamSchema.index({ userId: 1, isActive: 1 });
TeamSchema.index({ userId: 1, updatedAt: -1 });
// Validación: máximo 9 personajes por equipo
TeamSchema.pre('save', function (next) {
    if (this.characters.length > 9) {
        next(new Error('Un equipo no puede tener más de 9 personajes'));
    }
    next();
});
exports.Team = (0, mongoose_1.model)('Team', TeamSchema, 'teams');
