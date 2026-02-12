import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { Types } from 'mongoose';
import {
  listItemInMarketplace,
  buyItemFromMarketplace,
  cancelMarketplaceListing
} from '../controllers/marketplace.controller';
import ListingModel, { IListing } from '../models/Listing';
import MarketplaceTransaction from '../models/MarketplaceTransaction';

const router = Router();
console.log('[ROUTES] marketplace.routes initialized');
// Mostrar rutas registradas (safe access para evitar errores de TS en runtime de tests)
console.log('[ROUTES] marketplace.routes map:', router.stack.filter((s: any) => s.route).map((s: any) => ({ path: s.route?.path || '<unknown>', methods: s.route?.methods || {} })));

// Rutas normalizadas: montadas en /api/marketplace desde app.ts
router.get('/listings', auth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const query = { estado: 'activo' };
    
    // Obtener listings activos con paginación
    const listings = await ListingModel.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();
      
    // Count total for pagination
    const total = await ListingModel.countDocuments(query);
    
    res.json({
      success: true,
      listings,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    }); 
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Error al buscar en el mercado' });
  }
});

router.post('/listings', auth, listItemInMarketplace);
router.post('/listings/:listingId/buy', auth, buyItemFromMarketplace);
router.post('/listings/:listingId/cancel', auth, cancelMarketplaceListing);

// Historial de transacciones propias (paginado)
router.get('/history', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const page = Math.max(0, Number(req.query.page || 0));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = page * limit;

    const userId = new Types.ObjectId(user._id.toString());

    const query: any = {
      $or: [
        { sellerId: userId },
        { buyerId: userId }
      ]
    };

    const [data, total] = await Promise.all([
      MarketplaceTransaction.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      MarketplaceTransaction.countDocuments(query)
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
  } catch (error) {
    console.error('Error fetching marketplace history:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Detalle de un listing
router.get('/listings/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await ListingModel.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing no encontrado' });
    return res.json(listing);
  } catch (error) {
    console.error('Error obteniendo detalle listing:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar precio de un listing (opcional)
router.patch('/listings/:listingId/price', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { price } = req.body;
    if (typeof price !== 'number' || price <= 0) return res.status(400).json({ error: 'price inválido' });
    const listing = await ListingModel.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing no encontrado' });
    if (listing.sellerId?.toString() !== (req as any).user._id.toString()) return res.status(403).json({ error: 'No autorizado' });
    (listing as any).precio = price; // mantener compat con modelo existente
    await listing.save();
    return res.json({ success: true, precio: price });
  } catch (error) {
    console.error('Error actualizando precio listing:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
