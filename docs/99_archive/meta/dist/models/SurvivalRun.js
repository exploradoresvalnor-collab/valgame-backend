"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalRun = void 0;
const mongoose_1 = require("mongoose");
// --- SCHEMA ---
const SurvivalRunSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    characterId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    finalWave: { type: Number, required: true, min: 1 },
    finalPoints: { type: Number, required: true, min: 0 },
    totalEnemiesDefeated: { type: Number, required: true, min: 0 },
    itemsObtained: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item', required: true },
            rareza: { type: String, required: true },
            obtainedAtWave: { type: Number, required: true, min: 1 }
        }],
    rewards: new mongoose_1.Schema({
        expGained: { type: Number, required: true, min: 0 },
        valGained: { type: Number, required: true, min: 0 },
        pointsAvailable: { type: Number, required: true, min: 0 }
    }, { _id: false }),
    equipmentUsed: new mongoose_1.Schema({
        head: new mongoose_1.Schema({
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
            rareza: String
        }, { _id: false }),
        body: new mongoose_1.Schema({
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
            rareza: String
        }, { _id: false }),
        hands: new mongoose_1.Schema({
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
            rareza: String
        }, { _id: false }),
        feet: new mongoose_1.Schema({
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
            rareza: String
        }, { _id: false })
    }, { _id: false }),
    positionInRanking: { type: Number },
    startedAt: { type: Date, required: true, index: true },
    completedAt: { type: Date, required: true },
    duration: { type: Number, required: true, min: 0 }
}, {
    timestamps: true,
    versionKey: false
});
// Campo opcional con detalles de hitos aplicados
SurvivalRunSchema.add({
    scenarioSlug: { type: String },
    milestoneDetails: [{
            milestoneNumber: { type: Number },
            rewards: new mongoose_1.Schema({
                exp: { type: Number, default: 0 },
                val: { type: Number, default: 0 },
                items: [{
                        itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
                        nombre: String,
                        cantidad: { type: Number, default: 1 }
                    }]
            }, { _id: false }),
            appliedAt: { type: Date, default: Date.now }
        }]
});
// Índices para búsquedas comunes
SurvivalRunSchema.index({ userId: 1, completedAt: -1 });
SurvivalRunSchema.index({ finalWave: -1 });
SurvivalRunSchema.index({ finalPoints: -1 });
SurvivalRunSchema.index({ userId: 1, finalWave: -1 });
exports.SurvivalRun = (0, mongoose_1.model)('SurvivalRun', SurvivalRunSchema, 'survival_runs');
