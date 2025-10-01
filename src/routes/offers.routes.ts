import { Router } from 'express';
import Offer from '../models/Offer';

const router = Router();

// GET /api/offers - Obtener todas las ofertas activas
router.get('/', async (req, res) => {
  try {
    const activeOffers = await Offer.find({ activo: true, fechaInicio: { $lte: new Date() }, fechaFin: { $gte: new Date() } });
    res.json(activeOffers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ofertas' });
  }
});

export default router;