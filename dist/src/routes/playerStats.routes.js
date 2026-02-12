"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const PlayerStat_1 = __importDefault(require("../models/PlayerStat"));
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// GET /api/player-stats - Obtener estadísticas del usuario autenticado
router.get('/', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Calcular estadísticas básicas del jugador
        const stats = {
            totalPartidas: (user.dungeon_stats?.total_victorias || 0) + (user.dungeon_stats?.total_derrotas || 0),
            victorias: user.dungeon_stats?.total_victorias || 0,
            derrotas: user.dungeon_stats?.total_derrotas || 0,
            rachaActual: user.dungeon_streak || 0,
            mejorRacha: user.max_dungeon_streak || 0,
            tiempoJugado: 0, // Placeholder - no implementado aún
            nivelPromedioPersonajes: user.personajes && user.personajes.length > 0
                ? Math.round(user.personajes.reduce((sum, p) => sum + (p.nivel || 1), 0) / user.personajes.length)
                : 1,
            totalPersonajes: user.personajes?.length || 0,
            totalItems: (user.inventarioEquipamiento?.length || 0) + (user.inventarioConsumibles?.length || 0)
        };
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        console.error('Error al obtener estadísticas del jugador:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Registrar una estadística de jugador
router.post('/', async (req, res) => {
    const { userId, personajeId, fecha, valAcumulado, fuente } = req.body;
    if (!userId || !personajeId || !fecha || valAcumulado == null || !fuente) {
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }
    try {
        const stat = await PlayerStat_1.default.create({ userId, personajeId, fecha, valAcumulado, fuente });
        res.json({ ok: true, stat });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al registrar estadística.' });
    }
});
// Consultar estadísticas por usuario
router.get('/usuario/:userId', async (req, res) => {
    try {
        const stats = await PlayerStat_1.default.find({ userId: req.params.userId });
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar estadísticas.' });
    }
});
// Consultar estadísticas por personaje
router.get('/personaje/:personajeId', async (req, res) => {
    try {
        const stats = await PlayerStat_1.default.find({ personajeId: req.params.personajeId });
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar estadísticas.' });
    }
});
exports.default = router;
