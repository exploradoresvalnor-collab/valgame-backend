"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_service_1 = __importDefault(require("../services/payment.service"));
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const mongoose_1 = require("mongoose");
const realtime_service_1 = require("../services/realtime.service");
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
// POST /api/payments/blockchain/initiate - iniciar pago Web3
router.post('/blockchain/initiate', auth_1.auth, async (req, res) => {
    try {
        const { packageId, chain = 'evm', amountUSDT, walletAddress } = req.body;
        if (!req.userId)
            return res.status(401).json({ error: 'No autenticado' });
        if (!walletAddress)
            return res.status(400).json({ error: 'walletAddress requerido' });
        // Si existe lógica en paymentService, usarla; si no, stub temporal
        if (typeof payment_service_1.default.initiateBlockchainPayment === 'function') {
            const tx = await payment_service_1.default.initiateBlockchainPayment({
                userId: req.userId,
                packageId,
                chain,
                amountUSDT,
                walletAddress
            });
            // Emitir evento de inicio de pago blockchain
            try {
                const rt = realtime_service_1.RealtimeService.getInstance();
                rt.notifyPaymentStatus(req.userId, {
                    provider: 'blockchain',
                    state: 'initiated',
                    meta: { packageId, chain, amountUSDT, walletAddress, tx }
                });
            }
            catch (_) { }
            return res.json({ success: true, data: tx });
        }
        // Emitir evento en stub también
        try {
            const rt = realtime_service_1.RealtimeService.getInstance();
            rt.notifyPaymentStatus(req.userId, {
                provider: 'blockchain',
                state: 'initiated',
                meta: { packageId, chain, amountUSDT, walletAddress }
            });
        }
        catch (_) { }
        return res.json({ success: true, stub: true, message: 'Blockchain initiate pendiente de lógica', data: { packageId, chain, amountUSDT, walletAddress } });
    }
    catch (error) {
        console.error('Error blockchain initiate:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/payments/wallet/connect - asociar wallet al usuario
router.post('/wallet/connect', auth_1.auth, async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!req.userId)
            return res.status(401).json({ error: 'No autenticado' });
        if (!walletAddress)
            return res.status(400).json({ error: 'walletAddress requerido' });
        const user = await User_1.User.findById(req.userId);
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        user.walletAddress = walletAddress;
        await user.save();
        return res.json({ success: true, walletAddress });
    }
    catch (error) {
        console.error('Error connect wallet:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/payments/history - historial de pagos (Stripe + Blockchain)
router.get('/history', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'No autenticado' });
        // Si existe método especializado
        if (typeof payment_service_1.default.getPaymentHistory === 'function') {
            const history = await payment_service_1.default.getPaymentHistory(mongoose_1.Types.ObjectId.createFromHexString(req.userId));
            return res.json({ success: true, data: history });
        }
        // Fallback stub
        return res.json({ success: true, stub: true, data: [], message: 'Implementar persistencia de historial' });
    }
    catch (error) {
        console.error('Error obteniendo payment history:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
exports.default = router;
