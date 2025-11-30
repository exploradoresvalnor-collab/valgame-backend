"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSettings_1 = require("./UserSettings");
// --- SCHEMAS ---
// --- NUEVO: Schema para Buffs Activos ---
const ActiveBuffSchema = new mongoose_1.Schema({
    consumableId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item', required: true },
    effects: {
        mejora_atk: { type: Number },
        mejora_defensa: { type: Number },
        mejora_vida: { type: Number },
        mejora_xp_porcentaje: { type: Number } // <-- AÑADIDO
    },
    expiresAt: { type: Date, required: true }
}, { _id: false });
const PersonajeSchema = new mongoose_1.Schema({
    personajeId: { type: String, required: true, index: true },
    rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
    nivel: { type: Number, min: 1, max: 100, default: 1 },
    etapa: { type: Number, enum: [1, 2, 3], default: 1 },
    progreso: { type: Number, min: 0, default: 0 },
    experiencia: { type: Number, min: 0, default: 0 },
    stats: {
        atk: { type: Number, min: 0, default: 0 },
        vida: { type: Number, min: 0, default: 0 },
        defensa: { type: Number, min: 0, default: 0 }
    },
    saludActual: { type: Number, default: 100 },
    saludMaxima: { type: Number, default: 100 },
    estado: { type: String, enum: ['saludable', 'herido'], default: 'saludable' },
    fechaHerido: { type: Date, default: null },
    // La referencia ahora apunta a 'Item', ya que 'Equipment' es un tipo de 'Item'
    equipamiento: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' }],
    activeBuffs: { type: [ActiveBuffSchema], default: [] }
}, {
    _id: true
});
// Schema para el inventario de consumibles
const ConsumableItemSchema = new mongoose_1.Schema({
    consumableId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Consumable'
    },
    usos_restantes: { type: Number, required: true, min: 0 }
}, { _id: true }); // _id: true para que cada instancia sea única
const UserSchema = new mongoose_1.Schema({
    email: { type: String, unique: true, index: true, required: true },
    username: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpires: { type: Date },
    walletAddress: { type: String, unique: true, sparse: true },
    val: { type: Number, default: 0, min: 0 },
    boletos: { type: Number, default: 0, min: 0 },
    energia: { type: Number, default: 100, min: 0 },
    energiaMaxima: { type: Number, default: 100, min: 1 },
    ultimoReinicioEnergia: { type: Date },
    evo: { type: Number, default: 0, min: 0 },
    invocaciones: { type: Number, default: 0, min: 0 },
    evoluciones: { type: Number, default: 0, min: 0 },
    boletosDiarios: { type: Number, default: 0, min: 0, max: 10 },
    ultimoReinicio: { type: Date },
    personajes: { type: [PersonajeSchema], default: [] },
    inventarioEquipamiento: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' }],
    inventarioConsumibles: { type: [ConsumableItemSchema], default: [] },
    limiteInventarioEquipamiento: { type: Number, default: 20 },
    limiteInventarioConsumibles: { type: Number, default: 50 },
    limiteInventarioPersonajes: { type: Number, default: 50 },
    personajeActivoId: { type: String },
    // Flag para indicar si el usuario ya recibió el Paquete del Pionero
    receivedPioneerPackage: { type: Boolean, default: false },
    // Flag para indicar si el usuario completó el tutorial (FTUE)
    tutorialCompleted: { type: Boolean, default: false },
    // Configuración del usuario (subdocumento embebido)
    settings: { type: UserSettings_1.UserSettingsSchema, default: () => ({}) },
    // Progreso de mazmorras por usuario (Map<dungeonId, progressData>)
    dungeon_progress: {
        type: Map,
        of: new mongoose_1.Schema({
            victorias: { type: Number, default: 0, min: 0 },
            derrotas: { type: Number, default: 0, min: 0 },
            nivel_actual: { type: Number, default: 1, min: 1 },
            puntos_acumulados: { type: Number, default: 0, min: 0 },
            puntos_requeridos_siguiente_nivel: { type: Number, default: 100, min: 1 },
            mejor_tiempo: { type: Number, default: 0, min: 0 }, // en segundos
            ultima_victoria: { type: Date }
        }, { _id: false }),
        default: () => new Map()
    },
    dungeon_streak: { type: Number, default: 0, min: 0 },
    max_dungeon_streak: { type: Number, default: 0, min: 0 },
    dungeon_stats: {
        type: new mongoose_1.Schema({
            total_victorias: { type: Number, default: 0, min: 0 },
            total_derrotas: { type: Number, default: 0, min: 0 },
            mejor_racha: { type: Number, default: 0, min: 0 }
        }, { _id: false }),
        default: () => ({ total_victorias: 0, total_derrotas: 0, mejor_racha: 0 })
    },
    survivalPoints: { type: Number, default: 0, min: 0 },
    currentSurvivalSession: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SurvivalSession', default: null },
    survivalStats: {
        type: new mongoose_1.Schema({
            totalRuns: { type: Number, default: 0, min: 0 },
            maxWave: { type: Number, default: 0, min: 0 },
            totalPoints: { type: Number, default: 0, min: 0 },
            averageWave: { type: Number, default: 0, min: 0 }
        }, { _id: false }),
        default: () => ({ totalRuns: 0, maxWave: 0, totalPoints: 0, averageWave: 0 })
    },
    // Logros desbloqueados del usuario
    logros_desbloqueados: [
        {
            achievementId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Achievement', required: true },
            fechaDesbloqueo: { type: Date, default: Date.now }
        }
    ]
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
