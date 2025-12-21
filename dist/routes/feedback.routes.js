"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const memoryStore = [];
const router = (0, express_1.Router)();
// POST /api/feedback - enviar feedback
router.post('/', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'No autenticado' });
        const { message, category } = req.body;
        if (!message || typeof message !== 'string' || message.length < 3) {
            return res.status(400).json({ error: 'Mensaje inválido' });
        }
        const entry = {
            id: (Date.now() + Math.random()).toString(36),
            userId: req.userId,
            message,
            category,
            createdAt: new Date().toISOString()
        };
        memoryStore.push(entry);
        // Futuro: persistir en colección Feedback
        return res.status(202).json({ accepted: true, entry });
    }
    catch (error) {
        console.error('Error guardando feedback:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/feedback (opcional debug, no auth estricta requerida?)
router.get('/', auth_1.auth, (_req, res) => {
    return res.json({ total: memoryStore.length, feedback: memoryStore.slice(-50).reverse() });
});
exports.default = router;
