"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const MarketplaceTransaction_1 = __importDefault(require("../models/MarketplaceTransaction"));
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
/**
 * GET /api/marketplace-transactions/my-history
 * Obtener el historial completo de transacciones del usuario autenticado
 */
router.get('/my-history', auth_1.auth, async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { limit = 50, offset = 0, action } = req.query;
        const query = {
            $or: [
                { sellerId: new mongoose_1.Types.ObjectId(userId) },
                { buyerId: new mongoose_1.Types.ObjectId(userId) }
            ]
        };
        // Filtro opcional por tipo de acción
        if (action && ['listed', 'sold', 'cancelled', 'expired'].includes(action)) {
            query.action = action;
        }
        const [transactions, total] = await Promise.all([
            MarketplaceTransaction_1.default
                .find(query)
                .sort({ timestamp: -1 })
                .limit(Math.min(Number(limit), 100))
                .skip(Number(offset))
                .lean(),
            MarketplaceTransaction_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: transactions,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset),
                hasMore: (Number(offset) + transactions.length) < total
            }
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/marketplace-transactions/my-sales
 * Obtener solo las ventas del usuario (como vendedor)
 */
router.get('/my-sales', auth_1.auth, async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { limit = 50, offset = 0 } = req.query;
        const query = {
            sellerId: new mongoose_1.Types.ObjectId(userId),
            action: { $in: ['listed', 'sold', 'cancelled', 'expired'] }
        };
        const [transactions, total] = await Promise.all([
            MarketplaceTransaction_1.default
                .find(query)
                .sort({ timestamp: -1 })
                .limit(Math.min(Number(limit), 100))
                .skip(Number(offset))
                .lean(),
            MarketplaceTransaction_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: transactions,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset),
                hasMore: (Number(offset) + transactions.length) < total
            }
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/marketplace-transactions/my-purchases
 * Obtener solo las compras del usuario (como comprador)
 */
router.get('/my-purchases', auth_1.auth, async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { limit = 50, offset = 0 } = req.query;
        const query = {
            buyerId: new mongoose_1.Types.ObjectId(userId),
            action: 'sold'
        };
        const [transactions, total] = await Promise.all([
            MarketplaceTransaction_1.default
                .find(query)
                .sort({ timestamp: -1 })
                .limit(Math.min(Number(limit), 100))
                .skip(Number(offset))
                .lean(),
            MarketplaceTransaction_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: transactions,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset),
                hasMore: (Number(offset) + transactions.length) < total
            }
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/marketplace-transactions/stats
 * Obtener estadísticas agregadas del usuario
 */
router.get('/stats', auth_1.auth, async (req, res, next) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user._id.toString());
        // Estadísticas de ventas
        const salesStats = await MarketplaceTransaction_1.default.aggregate([
            { $match: { sellerId: userId, action: 'sold' } },
            {
                $group: {
                    _id: null,
                    totalVentas: { $sum: 1 },
                    ingresosBrutos: { $sum: '$precioFinal' },
                    impuestosPagados: { $sum: '$impuesto' },
                    ingresosNetos: { $sum: { $subtract: ['$precioFinal', '$impuesto'] } }
                }
            }
        ]);
        // Estadísticas de compras
        const purchaseStats = await MarketplaceTransaction_1.default.aggregate([
            { $match: { buyerId: userId, action: 'sold' } },
            {
                $group: {
                    _id: null,
                    totalCompras: { $sum: 1 },
                    gastoTotal: { $sum: '$precioFinal' }
                }
            }
        ]);
        // Contadores de listados
        const listingCounts = await MarketplaceTransaction_1.default.aggregate([
            { $match: { sellerId: userId } },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Items más vendidos
        const topItems = await MarketplaceTransaction_1.default.aggregate([
            { $match: { sellerId: userId, action: 'sold' } },
            {
                $group: {
                    _id: '$itemMetadata.nombre',
                    ventas: { $sum: 1 },
                    ingresoTotal: { $sum: '$precioFinal' }
                }
            },
            { $sort: { ventas: -1 } },
            { $limit: 10 }
        ]);
        res.json({
            success: true,
            stats: {
                ventas: salesStats[0] || { totalVentas: 0, ingresosBrutos: 0, impuestosPagados: 0, ingresosNetos: 0 },
                compras: purchaseStats[0] || { totalCompras: 0, gastoTotal: 0 },
                listados: listingCounts.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                topItems
            }
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/marketplace-transactions/:listingId
 * Obtener todas las transacciones relacionadas con un listado específico
 */
router.get('/:listingId', auth_1.auth, async (req, res, next) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id.toString();
        const transactions = await MarketplaceTransaction_1.default
            .find({ listingId: new mongoose_1.Types.ObjectId(listingId) })
            .sort({ timestamp: 1 })
            .lean();
        // Verificar que el usuario tiene acceso (es seller o buyer)
        const hasAccess = transactions.some(t => t.sellerId.toString() === userId ||
            (t.buyerId && t.buyerId.toString() === userId));
        if (!hasAccess && transactions.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver estas transacciones'
            });
        }
        res.json({
            success: true,
            data: transactions
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
