import { Router } from 'express';
import { Item } from '../models/Item';
import { auth } from '../middlewares/auth';
import { buyItem } from '../controllers/items.controller';

const router = Router();

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ítems.' });
  }
});

// POST /api/items/:id/buy - Comprar ítem desde la tienda
router.post('/:id/buy', auth, buyItem);

export default router;
