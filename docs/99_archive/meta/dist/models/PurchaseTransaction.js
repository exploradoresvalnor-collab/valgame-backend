"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PurchaseTransactionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item', required: false },
    paqueteId: { type: String, required: false },
    cantidad: { type: Number, required: true, min: 1, default: 1 },
    currency: { type: String, enum: ['val', 'boletos'], required: true },
    totalCostoVal: { type: Number, required: true, min: 0 },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed }
}, { versionKey: false });
exports.default = (0, mongoose_1.model)('PurchaseTransaction', PurchaseTransactionSchema, 'purchase_transactions');
