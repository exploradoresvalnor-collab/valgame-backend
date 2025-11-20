"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBlacklist = void 0;
const mongoose_1 = require("mongoose");
const TokenBlacklistSchema = new mongoose_1.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
});
// Índice TTL para que MongoDB elimine automáticamente los tokens expirados
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.TokenBlacklist = (0, mongoose_1.model)('TokenBlacklist', TokenBlacklistSchema, 'token_blacklist');
