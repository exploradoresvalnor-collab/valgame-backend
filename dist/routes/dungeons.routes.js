"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Dungeon_1 = __importDefault(require("../models/Dungeon"));
const dungeons_controller_1 = require("../controllers/dungeons.controller"); // 1. Importa la función del controlador de combate
const auth_1 = require("../middlewares/auth"); // 2. Importa el middleware de autenticación
const router = (0, express_1.Router)();
// GET /api/dungeons - Obtener la lista de mazmorras (Ruta Pública)
router.get('/', async (_req, res) => {
    try {
        const dungeons = await Dungeon_1.default.find({});
        res.json(dungeons);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dungeons' });
    }
});
// --- 👇 RUTA NUEVA PARA INICIAR EL COMBATE (LA PELEA) 👇 ---
// POST /api/dungeons/:dungeonId/start (Ruta Protegida)
router.post('/:dungeonId/start', auth_1.auth, dungeons_controller_1.startDungeon);
exports.default = router;
