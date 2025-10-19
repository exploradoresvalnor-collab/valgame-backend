"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserPackage_1 = __importDefault(require("../models/UserPackage"));
const User_1 = require("../models/User");
const Package_1 = __importDefault(require("../models/Package"));
const Category_1 = __importDefault(require("../models/Category"));
const BaseCharacter_1 = __importDefault(require("../models/BaseCharacter"));
const mongoose_1 = require("mongoose");
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
// POST /api/user-packages/open
// body: { userId, paqueteId }  (paqueteId opcional si el usuario tiene un UserPackage)
router.post('/open', async (req, res) => {
    const { userId, paqueteId } = req.body;
    if (!userId)
        return res.status(400).json({ error: 'Falta userId' });
    try {
        const user = await User_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        let pkg;
        if (paqueteId) {
            pkg = await Package_1.default.findById(paqueteId);
        }
        else {
            // buscar un UserPackage disponible
            const up = await UserPackage_1.default.findOne({ userId });
            if (!up)
                return res.status(404).json({ error: 'Usuario no tiene paquetes' });
            pkg = await Package_1.default.findById(up.paqueteId);
            // eliminar el UserPackage (consumir)
            await up.deleteOne();
        }
        if (!pkg)
            return res.status(404).json({ error: 'Paquete no encontrado' });
        // 1) Añadir val_reward si existe
        if (pkg.val_reward) {
            user.val = (user.val || 0) + pkg.val_reward;
        }
        // 2) Añadir items_reward si existen
        if (pkg.items_reward && Array.isArray(pkg.items_reward)) {
            for (const itemId of pkg.items_reward) {
                // si es equipment añadir a inventarioEquipamiento, si es consumable añadir a inventarioConsumibles
                // simplificamos: añadimos a inventarioEquipamiento
                user.inventarioEquipamiento = user.inventarioEquipamiento || [];
                if (!user.inventarioEquipamiento.some((id) => String(id) === String(itemId))) {
                    user.inventarioEquipamiento.push(new mongoose_1.Types.ObjectId(String(itemId)));
                }
            }
        }
        // 3) Asignar personajes (personajes: pkg.personajes)
        const toAssign = pkg.personajes || 1;
        const assigned = [];
        // Si hay categorias_garantizadas, primero asignarlas
        const guaranteed = pkg.categorias_garantizadas || [];
        const categoriesList = await Category_1.default.find();
        function chooseRandomBaseForCategory(catName) {
            return BaseCharacter_1.default.aggregate([
                { $match: { descripcion_rango: catName } },
                { $sample: { size: 1 } }
            ]).then((res) => res[0]);
        }
        // Rellenar con garantizados
        for (const cat of guaranteed) {
            if (assigned.length >= toAssign)
                break;
            const base = await chooseRandomBaseForCategory(cat);
            if (base) {
                user.personajes.push({
                    personajeId: base.id,
                    rango: cat,
                    nivel: 1,
                    etapa: 1,
                    progreso: 0,
                    stats: base.stats,
                    saludActual: base.stats.vida,
                    saludMaxima: base.stats.vida,
                    estado: 'saludable',
                    fechaHerido: null,
                    equipamiento: [],
                    activeBuffs: []
                });
                assigned.push(base.id);
            }
        }
        // Si faltan, asignar aleatoriamente por probabilidades en Category
        while (assigned.length < toAssign) {
            // elegir categoría por probabilidad
            const cats = categoriesList;
            const r = Math.random();
            let accum = 0;
            let chosenCat = cats[cats.length - 1].nombre;
            for (const c of cats) {
                accum += c.probabilidad || 0;
                if (r <= accum) {
                    chosenCat = c.nombre;
                    break;
                }
            }
            const base = await chooseRandomBaseForCategory(chosenCat);
            if (base) {
                user.personajes.push({
                    personajeId: base.id,
                    rango: chosenCat,
                    nivel: 1,
                    etapa: 1,
                    progreso: 0,
                    stats: base.stats,
                    saludActual: base.stats.vida,
                    saludMaxima: base.stats.vida,
                    estado: 'saludable',
                    fechaHerido: null,
                    equipamiento: [],
                    activeBuffs: []
                });
                assigned.push(base.id);
            }
            else {
                // si no hay base para esa categoria, romper para evitar loop infinito
                break;
            }
        }
        await user.save();
        res.json({ ok: true, assigned });
    }
    catch (err) {
        console.error('[USER-PACKAGE-OPEN] Error:', err);
        res.status(500).json({ error: 'Error al abrir paquete' });
    }
});
