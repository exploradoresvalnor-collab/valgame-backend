import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { auth } from '../middlewares/auth';

const router = Router();

// Lista usuarios (solo para probar)
router.get('/', auth, async (_req: Request, res: Response) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

// Datos del usuario autenticado
router.get('/me', auth, async (req: Request, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });

  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  res.json(user);
});

export default router;
