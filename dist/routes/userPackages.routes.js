"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserPackage_1 = __importDefault(require("../models/UserPackage"));
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Agregar paquete a usuario
router.post('/agregar', async (req, res) => {
    const { userId, paqueteId } = req.body;
    if (!userId || !paqueteId)
        return res.status(400).json({ error: 'Faltan datos.' });
    try {
        const nuevo = await UserPackage_1.default.create({ userId, paqueteId });
        res.json({ ok: true, userPackage: nuevo });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al agregar paquete.' });
    }
});
// Quitar paquete a usuario
router.post('/quitar', async (req, res) => {
    const { userId, paqueteId } = req.body;
    if (!userId || !paqueteId)
        return res.status(400).json({ error: 'Faltan datos.' });
    try {
        const eliminado = await UserPackage_1.default.findOneAndDelete({ userId, paqueteId });
        if (!eliminado)
            return res.status(404).json({ error: 'No encontrado.' });
        res.json({ ok: true, eliminado });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al quitar paquete.' });
    }
});
// Consultar paquetes de un usuario por userId (GET)
router.get('/:userId', async (req, res) => {
    try {
        const paquetes = await UserPackage_1.default.find({ userId: req.params.userId });
        res.json(paquetes);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar paquetes del usuario.' });
    }
});
// Consultar paquetes de un usuario por correo (POST)
router.post('/por-correo', async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: 'Falta el correo.' });
    try {
        // Buscar el usuario por correo
        const usuario = await User_1.User.findOne({ email });
        if (!usuario)
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        const paquetes = await UserPackage_1.default.find({ userId: usuario._id });
        res.json(paquetes);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar paquetes por correo.' });
    }
});
exports.default = router;
