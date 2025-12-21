import { Router, Request, Response } from 'express';
import { auth } from '../middlewares/auth';
import {
  getGlobalRanking,
  getUserRanking,
  getRankingByPeriod,
  getRankingStats,
  getLeaderboardByCategory
} from '../controllers/rankings.controller';

const router = Router();

// Rutas públicas
router.get('/', getGlobalRanking); // GET /api/rankings?limit=100&periodo=global
router.get('/leaderboard/:category', getLeaderboardByCategory); // GET /api/rankings/leaderboard/level?page=0&limit=20
router.get('/period/:periodo', getRankingByPeriod); // GET /api/rankings/period/2025-W45
// Alias: GET /api/rankings/period/:period → mapea a :periodo
router.get('/period/:period', (req: Request, res: Response, next) => {
  (req as any).params.periodo = req.params.period;
  return (getRankingByPeriod as any)(req, res, next as any);
});
router.get('/stats', getRankingStats); // GET /api/rankings/stats?periodo=global

// Rutas protegidas (requieren autenticación)
router.get('/me', auth, getUserRanking); // GET /api/rankings/me

export default router;
