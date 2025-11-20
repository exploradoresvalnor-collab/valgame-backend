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
const MarketplaceTransactionSchema = new mongoose_1.Schema({
    listingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    itemId: { type: String, required: true, index: true },
    itemType: {
        type: String,
        required: true,
        enum: ['personaje', 'equipamiento', 'consumible', 'especial']
    },
    precioOriginal: { type: Number, required: true },
    precioFinal: { type: Number, required: true },
    impuesto: { type: Number, required: true },
    action: {
        type: String,
        required: true,
        enum: ['listed', 'sold', 'cancelled', 'expired'],
        index: true
    },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    itemMetadata: {
        nombre: { type: String },
        imagen: { type: String },
        descripcion: { type: String },
        rango: { type: String },
        nivel: { type: Number },
        stats: {
            atk: { type: Number },
            defensa: { type: Number },
            vida: { type: Number }
        }
    },
    balanceSnapshot: {
        sellerBalanceBefore: { type: Number },
        sellerBalanceAfter: { type: Number },
        buyerBalanceBefore: { type: Number },
        buyerBalanceAfter: { type: Number }
    },
    listingDuration: { type: Number },
    metadata: {
        userAgent: { type: String },
        ip: { type: String },
        destacado: { type: Boolean },
        fechaExpiracion: { type: Date }
    }
}, {
    timestamps: true
});
// Índices compuestos para queries comunes
MarketplaceTransactionSchema.index({ sellerId: 1, timestamp: -1 });
MarketplaceTransactionSchema.index({ buyerId: 1, timestamp: -1 });
MarketplaceTransactionSchema.index({ action: 1, timestamp: -1 });
MarketplaceTransactionSchema.index({ itemType: 1, action: 1 });
exports.default = mongoose_1.default.model('MarketplaceTransaction', MarketplaceTransactionSchema);
