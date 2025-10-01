import { Router } from 'express';
import Dungeon from '../models/Dungeon';

const router = Router();

// GET all dungeons
router.get('/', async (_req, res) => {
  try {
    const dungeons = await Dungeon.find({});
    res.json(dungeons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dungeons' });
  }
});

export default router;