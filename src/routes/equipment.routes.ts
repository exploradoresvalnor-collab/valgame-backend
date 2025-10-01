import { Router } from 'express';
import Equipment from '../models/Equipment';

const router = Router();

// GET all equipment
router.get('/', async (_req, res) => {
  try {
    const equipment = await Equipment.find({});
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment' });
  }
});

export default router;