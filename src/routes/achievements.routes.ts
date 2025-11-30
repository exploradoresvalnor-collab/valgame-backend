import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  listAchievements,
  getUserAchievements,
  unlockAchievement
} from '../controllers/achievements.controller';

const router = Router();

// Rutas públicas
router.get('/', listAchievements); // GET /api/achievements?categoria=combate&limit=50&page=0

// Rutas con datos de usuario específico (públicas)
router.get('/:userId', getUserAchievements); // GET /api/achievements/:userId

// Rutas protegidas (requieren autenticación - admin)
router.post('/:userId/unlock', auth, unlockAchievement); // POST /api/achievements/:userId/unlock (body: { achievementId })

export default router;
