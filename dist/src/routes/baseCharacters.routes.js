"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BaseCharacter_1 = __importDefault(require("../models/BaseCharacter"));
const router = (0, express_1.Router)();
// GET /api/base-characters
router.get('/', async (req, res) => {
    try {
        const characters = await BaseCharacter_1.default.find();
        res.json(characters);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los personajes base.' });
    }
});
exports.default = router;
