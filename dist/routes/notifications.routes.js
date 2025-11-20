"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_1 = require("../models/Notification");
const auth_1 = require("../middlewares/auth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// GET /api/notifications - Listar notificaciones del usuario
router.get('/', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const { limit = '20', skip = '0', unreadOnly = 'false' } = req.query;
        const query = { userId: req.userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        const notifications = await Notification_1.Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));
        const total = await Notification_1.Notification.countDocuments(query);
        return res.json({
            notifications,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });
    }
    catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// GET /api/notifications/unread/count - Contador de notificaciones no leídas
router.get('/unread/count', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const count = await Notification_1.Notification.countDocuments({
            userId: req.userId,
            isRead: false
        });
        return res.json({ count });
    }
    catch (error) {
        console.error('Error al contar notificaciones no leídas:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// PUT /api/notifications/:id/read - Marcar una notificación como leída
router.put('/:id/read', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de notificación inválido' });
        }
        const notification = await Notification_1.Notification.findOneAndUpdate({ _id: id, userId: req.userId }, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }
        return res.json({
            message: 'Notificación marcada como leída',
            notification
        });
    }
    catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// PUT /api/notifications/read-all - Marcar todas las notificaciones como leídas
router.put('/read-all', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const result = await Notification_1.Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
        return res.json({
            message: 'Todas las notificaciones marcadas como leídas',
            modifiedCount: result.modifiedCount
        });
    }
    catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// DELETE /api/notifications/:id - Eliminar una notificación
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de notificación inválido' });
        }
        const notification = await Notification_1.Notification.findOneAndDelete({
            _id: id,
            userId: req.userId
        });
        if (!notification) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }
        return res.json({ message: 'Notificación eliminada correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar notificación:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
