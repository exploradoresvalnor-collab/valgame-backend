"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsSchema = void 0;
const mongoose_1 = require("mongoose");
// Schema embebido (subdocumento) para las configuraciones del usuario
exports.UserSettingsSchema = new mongoose_1.Schema({
    musicVolume: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    sfxVolume: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    language: {
        type: String,
        enum: ['es', 'en'],
        default: 'es'
    },
    notificationsEnabled: {
        type: Boolean,
        default: true
    }
}, { _id: false }); // No necesita _id propio ya que es un subdocumento embebido
