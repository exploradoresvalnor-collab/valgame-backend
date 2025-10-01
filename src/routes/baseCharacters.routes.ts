import { Router } from 'express';
import BaseCharacter from '../models/BaseCharacter';

const router = Router();

// GET /api/base-characters
router.get('/', async (req, res) => {
  try {
    const characters = await BaseCharacter.find();
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los personajes base.' });
  }
});

export default router;
