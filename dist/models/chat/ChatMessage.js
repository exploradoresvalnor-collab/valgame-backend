"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Schema para mensajes de chat
const chatMessageSchema = new mongoose_1.Schema({
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    senderName: {
        type: String,
        required: true,
        maxlength: 50
    },
    type: {
        type: String,
        enum: ['global', 'party', 'private'],
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 500,
        trim: true
    },
    recipientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.type === 'private';
        }
    },
    partyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: function () {
            return this.type === 'party';
        }
    },
    isSystemMessage: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'chat_messages'
});
// Índices para optimización
chatMessageSchema.index({ type: 1, createdAt: -1 });
chatMessageSchema.index({ recipientId: 1, createdAt: -1 });
chatMessageSchema.index({ partyId: 1, createdAt: -1 });
chatMessageSchema.index({ createdAt: -1 }); // Para obtener mensajes recientes
// Validación personalizada
chatMessageSchema.pre('save', function (next) {
    // Validar que el contenido no esté vacío después de trim
    if (!this.content || this.content.trim().length === 0) {
        const error = new Error('El contenido del mensaje no puede estar vacío');
        return next(error);
    }
    // Validar lógica de tipos
    if (this.type === 'private' && !this.recipientId) {
        const error = new Error('Los mensajes privados requieren un destinatario');
        return next(error);
    }
    if (this.type === 'party' && !this.partyId) {
        const error = new Error('Los mensajes de party requieren un partyId');
        return next(error);
    }
    next();
});
const ChatMessage = mongoose_1.default.model('ChatMessage', chatMessageSchema);
exports.default = ChatMessage;
