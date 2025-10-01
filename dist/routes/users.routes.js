"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Lista usuarios (solo para probar)
router.get('/', auth_1.auth, async (_req, res) => {
    const users = await User_1.User.find().select('-passwordHash');
    res.json(users);
});
// Datos del usuario autenticado
router.get('/me', auth_1.auth, async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'No autenticado' });
    const user = await User_1.User.findById(req.userId).select('-passwordHash');
    if (!user)
        return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
});
exports.default = router;
