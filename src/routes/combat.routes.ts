import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  startDungeonCombat,
  performAttack,
  performDefend,
  endCombat
} from '../controllers/combat.controller';

const router = Router();

/**
 * Iniciar combate en un dungeon
 * POST /api/dungeons/:dungeonId/start
 */
router.post('/dungeons/:dungeonId/start', auth, startDungeonCombat);

/**
 * Realizar ataque en combate
 * POST /api/combat/attack
 */
router.post('/attack', auth, performAttack);

/**
 * Defender en combate
 * POST /api/combat/defend
 */
router.post('/defend', auth, performDefend);

/**
 * Finalizar combate
 * POST /api/combat/end
 */
router.post('/end', auth, endCombat);

export default router;
