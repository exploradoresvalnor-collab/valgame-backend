"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MEJORA
    tipo: { type: String, enum: ['compra', 'recompensa', 'minado', 'uso', 'evolucion', 'evento'], required: true },
    item: { type: String, enum: ['VAL', 'Boleto', 'Evo', 'experiencia'], required: true },
    cantidad: { type: Number, required: true },
    fecha: { type: Date, default: Date.now, index: true },
    descripcion: { type: String, required: true },
    referenciaId: { type: String }
}, { collection: 'transactions', versionKey: false });
exports.Transaction = (0, mongoose_1.model)('Transaction', TransactionSchema);
