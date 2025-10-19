"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PlayerStat_1 = __importDefault(require("../models/PlayerStat"));
const router = (0, express_1.Router)();
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
