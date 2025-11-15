import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  getGlobalRanking,
  getUserRanking,
  getRankingByPeriod,
  getRankingStats
} from '../controllers/rankings.controller';

const router = Router();

// Rutas públicas
router.get('/', getGlobalRanking); // GET /api/rankings?limit=100&periodo=global
router.get('/period/:periodo', getRankingByPeriod); // GET /api/rankings/period/2025-W45
router.get('/stats', getRankingStats); // GET /api/rankings/stats?periodo=global

// Rutas protegidas (requieren autenticación)
router.get('/me', auth, getUserRanking); // GET /api/rankings/me

export default router;
