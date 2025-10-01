"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_1 = __importDefault(require("../models/Category"));
const router = (0, express_1.Router)();
// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categorias = await Category_1.default.find();
        res.json(categorias);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías.' });
    }
});
exports.default = router;
