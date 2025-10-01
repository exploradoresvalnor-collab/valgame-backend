import { Router } from 'express';
import Package from '../models/Package';

const router = Router();

// GET /api/packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los paquetes.' });
  }
});

export default router;
