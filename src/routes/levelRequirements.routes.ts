import { Router } from 'express';
import LevelRequirement from '../models/LevelRequirement';

const router = Router();

// GET /api/level-requirements
router.get('/', async (req, res) => {
  try {
    const levels = await LevelRequirement.find();
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los requisitos de nivel.' });
  }
});

export default router;
