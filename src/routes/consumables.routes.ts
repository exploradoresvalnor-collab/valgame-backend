import { Router } from 'express';
import { Consumable } from '../models/Consumable';

const router = Router();

// GET all consumables
router.get('/', async (_req, res) => {
  try {
    const consumables = await Consumable.find({});
    res.json(consumables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consumables' });
  }
});

export default router;