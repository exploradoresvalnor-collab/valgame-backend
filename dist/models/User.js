"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
// --- SCHEMAS ---
const PersonajeSchema = new mongoose_1.Schema({
    personajeId: { type: String, required: true, index: true },
    rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
    nivel: { type: Number, min: 1, max: 100, default: 1 },
    etapa: { type: Number, enum: [1, 2, 3], default: 1 },
    progreso: { type: Number, min: 0, default: 0 },
    stats: {
        atk: { type: Number, min: 0, default: 0 },
        vida: { type: Number, min: 0, default: 0 },
        defensa: { type: Number, min: 0, default: 0 }
    },
    // --- Definición de los nuevos campos en el Schema ---
    saludActual: { type: Number, default: 100 },
    saludMaxima: { type: Number, default: 100 },
    estado: { type: String, enum: ['saludable', 'herido'], default: 'saludable' },
    fechaHerido: { type: Date, default: null }
}, {
    // Aseguramos que cada personaje en el array tenga su propio _id para el Marketplace
    _id: true
});
const UserSchema = new mongoose_1.Schema({
    email: { type: String, unique: true, index: true, required: true },
    username: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    // --- Definición de los nuevos campos en el Schema ---
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    wallet: { type: String },
    val: { type: Number, default: 0, min: 0 },
    boletos: { type: Number, default: 0, min: 0 },
    evo: { type: Number, default: 0, min: 0 },
    minadoTotal: { type: Number, default: 0, min: 0 },
    invocaciones: { type: Number, default: 0, min: 0 },
    evoluciones: { type: Number, default: 0, min: 0 },
    boletosDiarios: { type: Number, default: 0, min: 0, max: 10 },
    ultimoReinicio: { type: Date },
    personajes: { type: [PersonajeSchema], default: [] },
    personajeActivoId: { type: String }
}, {
    timestamps: { createdAt: 'fechaRegistro', updatedAt: 'ultimaActualizacion' },
    versionKey: false
});
// La función toJSON para seguridad se mantiene igual
UserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        if (returnedObject && returnedObject._id != null) {
            returnedObject.id = returnedObject._id.toString();
            delete returnedObject._id;
        }
        if (returnedObject && 'passwordHash' in returnedObject) {
            delete returnedObject.passwordHash;
        }
    }
});
// Exportación correcta del modelo apuntando a la colección 'users'
exports.User = (0, mongoose_1.model)('User', UserSchema, 'users');
