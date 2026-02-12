"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// La importación por defecto desde tu modelo es correcta
const GameSetting_1 = __importDefault(require("../models/GameSetting"));
const router = (0, express_1.Router)();
// GET /api/game-settings (o el prefijo que uses en app.ts)
router.get('/', async (req, res) => {
    try {
        // Usamos findOne() para obtener un solo objeto
        const settings = await GameSetting_1.default.findOne();
        // Buena práctica: verificar si la configuración existe
        if (!settings) {
            return res.status(404).json({ error: 'La configuración del juego no fue encontrada.' });
        }
        res.json(settings); // Ahora esto enviará el objeto directamente
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener la configuración del juego.' });
    }
});
exports.default = router;
