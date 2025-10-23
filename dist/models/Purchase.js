"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Purchase = void 0;
const mongoose_1 = require("mongoose");
const PersonajeOtorgadoSchema = new mongoose_1.Schema({
    personajeId: { type: String, required: true },
    rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true }
}, { _id: false });
const PurchaseSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
    paqueteId: { type: String, required: true, index: true },
    valorPagadoUSDT: { type: Number, required: true, min: 0 },
    valRecibido: { type: Number, required: true, min: 0 },
    fechaCompra: { type: Date, default: Date.now, index: true },
    personajesOtorgados: { type: [PersonajeOtorgadoSchema], default: [] },
    externalPaymentId: { type: String, required: false, index: true },
    paymentProvider: { type: String, required: false },
    paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    onchainTxHash: { type: String, required: false }
}, { versionKey: false });
exports.Purchase = (0, mongoose_1.model)('Purchase', PurchaseSchema, 'purchases');
