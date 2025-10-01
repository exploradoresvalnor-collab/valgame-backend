"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LevelRequirement_1 = __importDefault(require("../models/LevelRequirement"));
const router = (0, express_1.Router)();
// GET /api/level-requirements
router.get('/', async (req, res) => {
    try {
        const levels = await LevelRequirement_1.default.find();
        res.json(levels);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los requisitos de nivel.' });
    }
});
exports.default = router;
