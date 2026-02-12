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
const OfferItemSchema = new mongoose_1.Schema({
    tipo: { type: String, enum: ['paquete', 'item', 'val', 'evo', 'boleto'], required: true },
    refId: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 }
}, { _id: false });
const OfferSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    imagenUrl: { type: String },
    items: { type: [OfferItemSchema], required: true },
    precioUSDT: { type: Number, min: 0 },
    precioVal: { type: Number, min: 0 },
    descuentoPorcentual: { type: Number, min: 0, max: 100 },
    fechaInicio: { type: Date, required: true, index: true },
    fechaFin: { type: Date, required: true, index: true },
    limitePorUsuario: { type: Number, default: 1, min: 0 },
    limiteTotal: { type: Number, min: 0 },
    activo: { type: Boolean, default: true, index: true }
}, {
    timestamps: true,
    versionKey: false
});
// Índice para buscar ofertas activas dentro de un rango de fechas
OfferSchema.index({ activo: 1, fechaInicio: 1, fechaFin: 1 });
exports.default = mongoose_1.default.model('Offer', OfferSchema, 'offers');
