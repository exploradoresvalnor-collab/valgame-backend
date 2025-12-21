"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// GET /api/inventory - inventario completo agrupado
router.get('/', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'No autenticado' });
        const user = await User_1.User.findById(req.userId).select('inventarioEquipamiento inventarioConsumibles');
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        return res.json({
            equipment: user.inventarioEquipamiento || [],
            consumables: user.inventarioConsumibles || []
        });
    }
    catch (error) {
        console.error('Error obteniendo inventario:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/inventory/equipment - inventario equipamiento
router.get('/equipment', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'No autenticado' });
        const user = await User_1.User.findById(req.userId).select('inventarioEquipamiento');
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        return res.json(user.inventarioEquipamiento || []);
    }
    catch (error) {
        console.error('Error obteniendo equipamiento:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/inventory/consumables - inventario consumibles
router.get('/consumables', auth_1.auth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'No autenticado' });
        const user = await User_1.User.findById(req.userId).select('inventarioConsumibles');
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        return res.json(user.inventarioConsumibles || []);
    }
    catch (error) {
        console.error('Error obteniendo consumibles:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
exports.default = router;
