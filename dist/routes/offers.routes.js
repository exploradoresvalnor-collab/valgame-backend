"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Offer_1 = __importDefault(require("../models/Offer"));
const router = (0, express_1.Router)();
// GET /api/offers - Obtener todas las ofertas activas
router.get('/', async (req, res) => {
    try {
        const activeOffers = await Offer_1.default.find({ activo: true, fechaInicio: { $lte: new Date() }, fechaFin: { $gte: new Date() } });
        res.json(activeOffers);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener las ofertas' });
    }
});
exports.default = router;
