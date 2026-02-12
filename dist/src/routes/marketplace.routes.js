"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const mongoose_1 = require("mongoose");
const marketplace_controller_1 = require("../controllers/marketplace.controller");
const Listing_1 = __importDefault(require("../models/Listing"));
const MarketplaceTransaction_1 = __importDefault(require("../models/MarketplaceTransaction"));
const router = (0, express_1.Router)();
console.log('[ROUTES] marketplace.routes initialized');
// Mostrar rutas registradas (safe access para evitar errores de TS en runtime de tests)
console.log('[ROUTES] marketplace.routes map:', router.stack.filter((s) => s.route).map((s) => ({ path: s.route?.path || '<unknown>', methods: s.route?.methods || {} })));
// Rutas normalizadas: montadas en /api/marketplace desde app.ts
router.get('/listings', auth_1.auth, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const query = { estado: 'activo' };
        // Obtener listings activos con paginación
        const listings = await Listing_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .lean();
        // Count total for pagination
        const total = await Listing_1.default.countDocuments(query);
        res.json({
            success: true,
            listings,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset)
            }
        });
    }
    catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Error al buscar en el mercado' });
    }
});
router.post('/listings', auth_1.auth, marketplace_controller_1.listItemInMarketplace);
router.post('/listings/:listingId/buy', auth_1.auth, marketplace_controller_1.buyItemFromMarketplace);
router.post('/listings/:listingId/cancel', auth_1.auth, marketplace_controller_1.cancelMarketplaceListing);
// Historial de transacciones propias (paginado)
router.get('/history', auth_1.auth, async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'No autenticado' });
        const page = Math.max(0, Number(req.query.page || 0));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
        const skip = page * limit;
        const userId = new mongoose_1.Types.ObjectId(user._id.toString());
        const query = {
            $or: [
                { sellerId: userId },
                { buyerId: userId }
            ]
        };
        const [data, total] = await Promise.all([
            MarketplaceTransaction_1.default.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
            MarketplaceTransaction_1.default.countDocuments(query)
        ]);
        return res.json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                hasMore: (page * limit + data.length) < total
            }
        });
    }
    catch (error) {
        console.error('Error fetching marketplace history:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// Detalle de un listing
router.get('/listings/:listingId', async (req, res) => {
    try {
        const { listingId } = req.params;
        const listing = await Listing_1.default.findById(listingId);
        if (!listing)
            return res.status(404).json({ error: 'Listing no encontrado' });
        return res.json(listing);
    }
    catch (error) {
        console.error('Error obteniendo detalle listing:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// Actualizar precio de un listing (opcional)
router.patch('/listings/:listingId/price', auth_1.auth, async (req, res) => {
    try {
        const { listingId } = req.params;
        const { price } = req.body;
        if (typeof price !== 'number' || price <= 0)
            return res.status(400).json({ error: 'price inválido' });
        const listing = await Listing_1.default.findById(listingId);
        if (!listing)
            return res.status(404).json({ error: 'Listing no encontrado' });
        if (listing.sellerId?.toString() !== req.user._id.toString())
            return res.status(403).json({ error: 'No autorizado' });
        listing.precio = price; // mantener compat con modelo existente
        await listing.save();
        return res.json({ success: true, precio: price });
    }
    catch (error) {
        console.error('Error actualizando precio listing:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
exports.default = router;
