"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_service_1 = __importDefault(require("../services/payment.service"));
const router = (0, express_1.Router)();
// Crear una orden/checkout (MVP mock)
router.post('/checkout', async (req, res) => {
    const { userId, paqueteId, valorUSDT } = req.body;
    try {
        const result = await payment_service_1.default.createCheckout(userId, paqueteId, valorUSDT);
        res.json(result);
    }
    catch (err) {
        console.error('Error creating checkout:', err);
        res.status(500).json({ error: 'error creating checkout' });
    }
});
// Webhook para recibir notificaciones del proveedor (idempotente)
// IMPORTANT: este endpoint debe montarse con express.raw({ type: 'application/json' }) en app.ts
router.post('/webhook', async (req, res) => {
    return payment_service_1.default.handleWebhook(req, res);
});
exports.default = router;
