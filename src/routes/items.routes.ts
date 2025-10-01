import { Router } from 'express';
import Item from '../models/Item';

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

export default router;
