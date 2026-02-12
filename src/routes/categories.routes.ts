import { Router } from 'express';
import Category from '../models/Category';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categorias = await Category.find();
    res.json({
      success: true,
      categories: categorias
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las categorías.' });
  }
});

export default router;
