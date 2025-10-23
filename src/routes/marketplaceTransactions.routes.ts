import { Router } from 'express';
import { auth } from '../middlewares/auth';
import MarketplaceTransaction from '../models/MarketplaceTransaction';
import { Types } from 'mongoose';

const router = Router();

/**
 * GET /api/marketplace-transactions/my-history
 * Obtener el historial completo de transacciones del usuario autenticado
 */
router.get('/my-history', auth, async (req, res, next) => {
  try {
    const userId = (req as any).user._id.toString();
    const { limit = 50, offset = 0, action } = req.query;

    const query: any = {
      $or: [
        { sellerId: new Types.ObjectId(userId) },
        { buyerId: new Types.ObjectId(userId) }
      ]
    };

    // Filtro opcional por tipo de acción
    if (action && ['listed', 'sold', 'cancelled', 'expired'].includes(action as string)) {
      query.action = action;
    }

    const [transactions, total] = await Promise.all([
      MarketplaceTransaction
        .find(query)
        .sort({ timestamp: -1 })
        .limit(Math.min(Number(limit), 100))
        .skip(Number(offset))
        .lean(),
      MarketplaceTransaction.countDocuments(query)
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace-transactions/my-sales
 * Obtener solo las ventas del usuario (como vendedor)
 */
router.get('/my-sales', auth, async (req, res, next) => {
  try {
    const userId = (req as any).user._id.toString();
    const { limit = 50, offset = 0 } = req.query;

    const query = {
      sellerId: new Types.ObjectId(userId),
      action: { $in: ['listed', 'sold', 'cancelled', 'expired'] }
    };

    const [transactions, total] = await Promise.all([
      MarketplaceTransaction
        .find(query)
        .sort({ timestamp: -1 })
        .limit(Math.min(Number(limit), 100))
        .skip(Number(offset))
        .lean(),
      MarketplaceTransaction.countDocuments(query)
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace-transactions/my-purchases
 * Obtener solo las compras del usuario (como comprador)
 */
router.get('/my-purchases', auth, async (req, res, next) => {
  try {
    const userId = (req as any).user._id.toString();
    const { limit = 50, offset = 0 } = req.query;

    const query = {
      buyerId: new Types.ObjectId(userId),
      action: 'sold'
    };

    const [transactions, total] = await Promise.all([
      MarketplaceTransaction
        .find(query)
        .sort({ timestamp: -1 })
        .limit(Math.min(Number(limit), 100))
        .skip(Number(offset))
        .lean(),
      MarketplaceTransaction.countDocuments(query)
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace-transactions/stats
 * Obtener estadísticas agregadas del usuario
 */
router.get('/stats', auth, async (req, res, next) => {
  try {
    const userId = new Types.ObjectId((req as any).user._id.toString());

    // Estadísticas de ventas
    const salesStats = await MarketplaceTransaction.aggregate([
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
    const purchaseStats = await MarketplaceTransaction.aggregate([
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
    const listingCounts = await MarketplaceTransaction.aggregate([
      { $match: { sellerId: userId } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    // Items más vendidos
    const topItems = await MarketplaceTransaction.aggregate([
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
        }, {} as Record<string, number>),
        topItems
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/marketplace-transactions/:listingId
 * Obtener todas las transacciones relacionadas con un listado específico
 */
router.get('/:listingId', auth, async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const userId = (req as any).user._id.toString();

    const transactions = await MarketplaceTransaction
      .find({ listingId: new Types.ObjectId(listingId) })
      .sort({ timestamp: 1 })
      .lean();

    // Verificar que el usuario tiene acceso (es seller o buyer)
    const hasAccess = transactions.some(t => 
      t.sellerId.toString() === userId || 
      (t.buyerId && t.buyerId.toString() === userId)
    );

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
  } catch (error) {
    next(error);
  }
});

export default router;
