"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalLeaderboard = void 0;
const mongoose_1 = require("mongoose");
// --- SCHEMA ---
const SurvivalLeaderboardSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    username: { type: String, required: true },
    characterName: { type: String, required: true },
    totalRuns: { type: Number, default: 0, min: 0 },
    averageWave: { type: Number, default: 0, min: 0 },
    maxWave: { type: Number, default: 0, min: 0, index: true },
    totalPoints: { type: Number, default: 0, min: 0, index: true },
    topRunId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SurvivalRun' },
    topRunWave: { type: Number, default: 0, min: 0 },
    topRunPoints: { type: Number, default: 0, min: 0 },
    rankingPosition: { type: Number },
    seasonRankingPosition: { type: Number },
    pointsAvailable: { type: Number, default: 0, min: 0 },
    lastRunAt: { type: Date },
    updatedAt: { type: Date, default: Date.now, index: true }
}, {
    timestamps: true,
    versionKey: false
});
// Índices compuestos para rankings
SurvivalLeaderboardSchema.index({ maxWave: -1, totalPoints: -1 });
SurvivalLeaderboardSchema.index({ totalRuns: -1 });
SurvivalLeaderboardSchema.index({ rankingPosition: 1 });
exports.SurvivalLeaderboard = (0, mongoose_1.model)('SurvivalLeaderboard', SurvivalLeaderboardSchema, 'survival_leaderboard');
