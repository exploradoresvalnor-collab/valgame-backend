import { Router } from 'express';
import Event from '../models/Event';

const router = Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los eventos.' });
  }
});

export default router;
