"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Item_1 = __importDefault(require("../models/Item"));
const router = (0, express_1.Router)();
// GET /api/items
router.get('/', async (req, res) => {
    try {
        const items = await Item_1.default.find();
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los ítems.' });
    }
});
exports.default = router;
