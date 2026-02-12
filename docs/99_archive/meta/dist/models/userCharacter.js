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
// Esquema de UserCharacter
const userCharacterSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    baseCharacterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'BaseCharacter',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 100
    },
    experience: {
        type: Number,
        default: 0,
        min: 0
    },
    stats: {
        health: { type: Number, required: true, min: 1 },
        attack: { type: Number, required: true, min: 0 },
        defense: { type: Number, required: true, min: 0 },
        speed: { type: Number, required: true, min: 0 }
    },
    equipment: {
        weapon: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
        armor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
        accessory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' }
    },
    inventory: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'UserItem'
        }],
    isAlive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Índices para optimización
userCharacterSchema.index({ userId: 1, isAlive: 1 });
userCharacterSchema.index({ level: -1 });
// Validación personalizada para asegurar que no haya más de 9 personajes vivos por usuario
userCharacterSchema.pre('save', async function (next) {
    if (this.isNew && this.isAlive) {
        const UserCharacter = mongoose_1.default.model('UserCharacter');
        const aliveCharactersCount = await UserCharacter.countDocuments({
            userId: this.userId,
            isAlive: true
        });
        if (aliveCharactersCount >= 9) {
            const error = new Error('No puedes tener más de 9 personajes vivos');
            return next(error);
        }
    }
    next();
});
exports.default = mongoose_1.default.model('UserCharacter', userCharacterSchema);
