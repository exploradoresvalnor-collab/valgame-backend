"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalSession = void 0;
const mongoose_1 = require("mongoose");
// --- SCHEMA ---
const SurvivalSessionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    characterId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    state: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active',
        index: true
    },
    equipment: {
        type: new mongoose_1.Schema({
            head: new mongoose_1.Schema({
                itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
                rareza: String,
                bonusAtaque: Number
            }, { _id: false }),
            body: new mongoose_1.Schema({
                itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
                rareza: String,
                bonusDefensa: Number
            }, { _id: false }),
            hands: new mongoose_1.Schema({
                itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
                rareza: String,
                bonusDefensa: Number
            }, { _id: false }),
            feet: new mongoose_1.Schema({
                itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
                rareza: String,
                bonusVelocidad: Number
            }, { _id: false })
        }, { _id: false }),
        default: () => ({})
    },
    consumables: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item', required: true },
            nombre: String,
            usos_restantes: { type: Number, required: true, min: 0 },
            efecto: new mongoose_1.Schema({
                tipo: {
                    type: String,
                    enum: ['heal', 'atk_boost', 'def_boost', 'xp_boost'],
                    required: true
                },
                valor: { type: Number, required: true }
            }, { _id: false })
        }],
    currentWave: { type: Number, default: 1, min: 1 },
    currentPoints: { type: Number, default: 0, min: 0 },
    totalPointsAccumulated: { type: Number, default: 0, min: 0 },
    enemiesDefeated: { type: Number, default: 0, min: 0 },
    healthCurrent: { type: Number, required: true },
    healthMax: { type: Number, required: true },
    multipliers: new mongoose_1.Schema({
        waveMultiplier: { type: Number, default: 1.0, min: 0.5 },
        survivalBonus: { type: Number, default: 1.0, min: 0.5 },
        equipmentBonus: { type: Number, default: 1.0, min: 0.5 }
    }, { _id: false }),
    dropsCollected: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item', required: true },
            nombre: String,
            rareza: String,
            timestamp: { type: Date, default: Date.now }
        }],
    startedAt: { type: Date, default: Date.now, index: true },
    lastActionAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    // Escenario y métricas
    scenarioSlug: { type: String, index: true },
    maxRoundReached: { type: Number, default: 0 },
    actionsLog: [{
            type: String,
            wave: Number,
            timestamp: Date,
            serverTime: Date
        }]
}, {
    timestamps: true,
    versionKey: false
});
// Índices para optimización
SurvivalSessionSchema.index({ userId: 1, state: 1 });
SurvivalSessionSchema.index({ userId: 1, startedAt: -1 });
exports.SurvivalSession = (0, mongoose_1.model)('SurvivalSession', SurvivalSessionSchema, 'survival_sessions');
