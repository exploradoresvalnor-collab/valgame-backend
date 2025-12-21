import { Router } from 'express';
import { auth } from '../middlewares/auth';

interface FeedbackEntry { id: string; userId: string; message: string; category?: string; createdAt: string; }
const memoryStore: FeedbackEntry[] = [];

const router = Router();

// POST /api/feedback - enviar feedback
router.post('/', auth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    const { message, category } = req.body;
    if (!message || typeof message !== 'string' || message.length < 3) {
      return res.status(400).json({ error: 'Mensaje inválido' });
    }
    const entry: FeedbackEntry = {
      id: (Date.now() + Math.random()).toString(36),
      userId: req.userId,
      message,
      category,
      createdAt: new Date().toISOString()
    };
    memoryStore.push(entry);
    // Futuro: persistir en colección Feedback
    return res.status(202).json({ accepted: true, entry });
  } catch (error) {
    console.error('Error guardando feedback:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/feedback (opcional debug, no auth estricta requerida?)
router.get('/', auth, (_req, res) => {
  return res.json({ total: memoryStore.length, feedback: memoryStore.slice(-50).reverse() });
});

export default router;
