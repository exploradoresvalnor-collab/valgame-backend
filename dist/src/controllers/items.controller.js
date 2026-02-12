"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyItem = void 0;
const Item_1 = require("../models/Item");
const User_1 = require("../models/User");
const item_service_1 = require("../services/item.service");
const buyItem = async (req, res) => {
    const { id: itemId } = req.params;
    const { cantidad = 1, currency = 'val' } = req.body;
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    try {
        const user = await User_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        const item = await Item_1.Item.findById(itemId);
        if (!item)
            return res.status(404).json({ error: 'Item no encontrado.' });
        const purchased = await item_service_1.ItemService.buyItem(user, itemId, Number(cantidad), currency === 'boletos' ? 'boletos' : 'val');
        return res.json({ ok: true, purchased });
    }
    catch (err) {
        if (err.name === 'InsufficientFundsError' || err.message?.toLowerCase().includes('insuf')) {
            return res.status(400).json({ error: err.message });
        }
        if (err.name === 'ValidationError' || err.message?.toLowerCase().includes('espacio')) {
            return res.status(400).json({ error: err.message });
        }
        if (err.name === 'NotFoundError') {
            return res.status(404).json({ error: err.message });
        }
        console.error('Error buyItem:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.buyItem = buyItem;
