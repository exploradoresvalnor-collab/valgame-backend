import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  listItemInMarketplace,
  buyItemFromMarketplace,
  cancelMarketplaceListing
} from '../controllers/marketplace.controller';
import ListingModel, { IListing } from '../models/Listing';

const router = Router();

router.post('/marketplace/list', auth, listItemInMarketplace);
router.post('/marketplace/buy/:listingId', auth, buyItemFromMarketplace);
router.post('/marketplace/cancel/:listingId', auth, cancelMarketplaceListing);

// Alias: historial de transacciones propias (usa marketplace-transactions internamente en futuro)
router.get('/marketplace/history', auth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    // Futura integración: marketplaceTransactionsService.obtenerHistorialUsuario(req.userId)
    return res.json({ success: true, stub: true, data: [], message: 'Implementar lógica de historial (alias)' });
  } catch (error) {
    console.error('Error history marketplace alias:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Detalle de un listing
router.get('/marketplace/:listingId', async (req, res) => {
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
router.patch('/marketplace/:listingId/price', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { price } = req.body;
    if (typeof price !== 'number' || price <= 0) return res.status(400).json({ error: 'price inválido' });
    const listing = await ListingModel.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing no encontrado' });
    if (listing.sellerId?.toString() !== req.userId) return res.status(403).json({ error: 'No autorizado' });
    (listing as any).precio = price; // mantener compat con modelo existente
    await listing.save();
    return res.json({ success: true, precio: price });
  } catch (error) {
    console.error('Error actualizando precio listing:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
