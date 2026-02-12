"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Item_1 = require("../models/Item");
const auth_1 = require("../middlewares/auth");
const items_controller_1 = require("../controllers/items.controller");
const router = (0, express_1.Router)();
// GET /api/items
router.get('/', async (req, res) => {
    try {
        const items = await Item_1.Item.find();
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los ítems.' });
    }
});
// POST /api/items/:id/buy - Comprar ítem desde la tienda
router.post('/:id/buy', auth_1.auth, items_controller_1.buyItem);
exports.default = router;
