"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'dungeon_victory',
            'dungeon_defeat',
            'character_healed',
            'character_leveled_up',
            'marketplace_sale',
            'marketplace_purchase',
            'package_opened',
            'system_announcement',
            'daily_reward'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
});
// Índice compuesto para consultas eficientes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// Índice TTL para eliminar automáticamente notificaciones antiguas después de 30 días
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 días
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema, 'notifications');
