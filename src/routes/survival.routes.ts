import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auth } from '../middlewares/auth';
import { SurvivalService } from '../services/survival.service';
import { User } from '../models/User';
import { SurvivalSession } from '../models/SurvivalSession';
import { SurvivalRun } from '../models/SurvivalRun';
import { SurvivalLeaderboard } from '../models/SurvivalLeaderboard';

const router = Router();
const survivalService = new SurvivalService();

// Middleware de validación
const validationMiddleware = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error: any) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: error.errors 
    });
  }
};

// Esquemas de validación Zod
// MEJORADO: equipmentIds y consumableIds ahora son opcionales
// Si no se proporcionan, se usan los del personaje automáticamente
const StartSurvivalSchema = z.object({
  characterId: z.string().min(1),
  equipmentIds: z.array(z.string()).length(4).optional(), // Opcional: si no se proporciona, se usa del personaje
  consumableIds: z.array(z.string()).max(5).optional() // Opcional: por defecto array vacío
});

const CompleteWaveSchema = z.object({
  waveNumber: z.number().min(1),
  enemiesDefeated: z.number().min(1),
  damageDealt: z.number().min(0),
  consumablesUsed: z.array(z.string()).optional()
});

const UseConsumableSchema = z.object({
  consumableId: z.string().min(1),
  targetSlot: z.enum(['player', 'enemy']).optional()
});

const PickupDropSchema = z.object({
  itemId: z.string().min(1),
  itemType: z.enum(['equipment', 'consumable', 'points']),
  itemValue: z.number().min(0).optional()
});

const EndSessionSchema = z.object({
  finalWave: z.number().min(1),
  totalEnemiesDefeated: z.number().min(0),
  totalPoints: z.number().min(0),
  duration: z.number().min(0)
});

const ExchangePointsSchema = z.object({
  points: z.number().min(1)
});

const ExchangeItemSchema = z.object({
  points: z.number().min(1),
  itemType: z.enum(['helmet', 'armor', 'gloves', 'boots', 'consumable'])
});

// ============================================================
// 1. POST /api/survival/start
// Iniciar nueva sesión de survival
// MEJORADO: equipmentIds y consumableIds son OPCIONALES
// - Si NO se envían equipmentIds: usa el equipamiento del personaje
// - Si NO se envían consumableIds: inicia sin consumibles
// ============================================================
router.post(
  '/start',
  auth,
  validationMiddleware(StartSurvivalSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { characterId, equipmentIds, consumableIds } = req.body;

      // Verificar que el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verificar que el personaje existe y pertenece al usuario
      const character = user.personajes.id(characterId);
      if (!character) {
        return res.status(400).json({ error: 'Character not found' });
      }

      // Crear nueva sesión (equipmentIds y consumableIds son opcionales)
      const session = await survivalService.startSurvival(
        userId,
        characterId,
        equipmentIds, // undefined si no se proporciona
        consumableIds // undefined si no se proporciona
      );

      // Actualizar usuario
      user.currentSurvivalSession = session._id;
      await user.save();

      return res.status(201).json({
        sessionId: session._id,
        message: 'Survival session started',
        session
      });
    } catch (error: any) {
      console.error('Error starting survival:', error);
      return res.status(500).json({ error: error.message || 'Failed to start survival' });
    }
  }
);

// ============================================================
// 2. POST /api/survival/:sessionId/complete-wave
// Completar una oleada
// ============================================================
router.post(
  '/:sessionId/complete-wave',
  auth,
  validationMiddleware(CompleteWaveSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { sessionId } = req.params;
      const { waveNumber, enemiesDefeated, damageDealt, consumablesUsed } = req.body;

      // Verificar que la sesión existe y pertenece al usuario
      const session = await SurvivalSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Anti-cheat: Validar que la onda está activa
      if (session.state !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      // Completar onda
      const updatedSession = await survivalService.completeWave(
        sessionId,
        waveNumber,
        enemiesDefeated,
        damageDealt,
        consumablesUsed || []
      );

      return res.status(200).json({
        message: 'Wave completed',
        session: updatedSession
      });
    } catch (error: any) {
      console.error('Error completing wave:', error);
      return res.status(500).json({ error: error.message || 'Failed to complete wave' });
    }
  }
);

// ============================================================
// 3. POST /api/survival/:sessionId/use-consumable
// Usar consumible durante el combate
// ============================================================
router.post(
  '/:sessionId/use-consumable',
  auth,
  validationMiddleware(UseConsumableSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { sessionId } = req.params;
      const { consumableId, targetSlot } = req.body;

      const session = await SurvivalSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.state !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      const updatedSession = await survivalService.useConsumable(
        sessionId,
        consumableId,
        targetSlot || 'player'
      );

      return res.status(200).json({
        message: 'Consumable used',
        session: updatedSession
      });
    } catch (error: any) {
      console.error('Error using consumable:', error);
      return res.status(500).json({ error: error.message || 'Failed to use consumable' });
    }
  }
);

// ============================================================
// 4. POST /api/survival/:sessionId/pickup-drop
// Recoger drop de enemigo
// ============================================================
router.post(
  '/:sessionId/pickup-drop',
  auth,
  validationMiddleware(PickupDropSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { sessionId } = req.params;
      const { itemId, itemType, itemValue } = req.body;

      const session = await SurvivalSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.state !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      const updatedSession = await survivalService.pickupDrop(
        sessionId,
        itemId,
        itemType,
        itemValue || 0
      );

      return res.status(200).json({
        message: 'Drop picked up',
        session: updatedSession
      });
    } catch (error: any) {
      console.error('Error picking up drop:', error);
      return res.status(500).json({ error: error.message || 'Failed to pick up drop' });
    }
  }
);

// ============================================================
// 5. POST /api/survival/:sessionId/end
// Terminar sesión exitosamente
// ============================================================
router.post(
  '/:sessionId/end',
  auth,
  validationMiddleware(EndSessionSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { sessionId } = req.params;
      const { finalWave, totalEnemiesDefeated, totalPoints, duration } = req.body;

      const session = await SurvivalSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.state !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      // Crear run histórico
      const run = await survivalService.endSurvival(
        userId,
        sessionId,
        finalWave,
        totalEnemiesDefeated,
        totalPoints,
        duration
      );

      // Actualizar usuario
      const user = await User.findById(userId);
      if (user) {
        user.survivalPoints = (user.survivalPoints || 0) + totalPoints;
        user.currentSurvivalSession = undefined;
        
        // Actualizar stats
        if (!user.survivalStats) {
          user.survivalStats = { totalRuns: 0, maxWave: 0, totalPoints: 0, averageWave: 0 };
        }
        user.survivalStats.totalRuns = (user.survivalStats.totalRuns || 0) + 1;
        user.survivalStats.maxWave = Math.max(user.survivalStats.maxWave || 0, finalWave);
        user.survivalStats.totalPoints = (user.survivalStats.totalPoints || 0) + totalPoints;
        user.survivalStats.averageWave = user.survivalStats.totalPoints / user.survivalStats.totalRuns;
        
        await user.save();
      }

      // Actualizar leaderboard
      await survivalService.updateLeaderboard(userId, finalWave, totalPoints, run._id.toString());

      return res.status(200).json({
        message: 'Session ended successfully',
        run,
        rewards: run.rewards
      });
    } catch (error: any) {
      console.error('Error ending session:', error);
      return res.status(500).json({ error: error.message || 'Failed to end session' });
    }
  }
);

// ============================================================
// 6. POST /api/survival/:sessionId/death
// Reportar muerte del jugador
// ============================================================
router.post(
  '/:sessionId/death',
  auth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { sessionId } = req.params;

      const session = await SurvivalSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.state !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      // Crear run con derrota
      const run = await survivalService.reportDeath(
        userId,
        sessionId,
        session.currentWave,
        session.currentPoints
      );

      // Actualizar usuario
      const user = await User.findById(userId);
      if (user) {
        user.currentSurvivalSession = undefined;
        await user.save();
      }

      return res.status(200).json({
        message: 'Death reported',
        run,
        rewards: { experience: 0, val: 0, points: 0 }
      });
    } catch (error: any) {
      console.error('Error reporting death:', error);
      return res.status(500).json({ error: error.message || 'Failed to report death' });
    }
  }
);

// ============================================================
// 7. POST /api/survival/exchange-points/exp
// Canjear puntos por experiencia
// ============================================================
router.post(
  '/exchange-points/exp',
  auth,
  validationMiddleware(ExchangePointsSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { points } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.survivalPoints || user.survivalPoints < points) {
        return res.status(400).json({ error: 'Insufficient survival points' });
      }

      // Realizar canje
      const result = await survivalService.exchangePointsForExp(userId, points);

      user.survivalPoints -= points;
      await user.save();

      return res.status(200).json({
        message: 'Points exchanged for experience',
        experienceGained: result.experienceGained,
        survivalPointsRemaining: user.survivalPoints
      });
    } catch (error: any) {
      console.error('Error exchanging points:', error);
      return res.status(500).json({ error: error.message || 'Failed to exchange points' });
    }
  }
);

// ============================================================
// 8. POST /api/survival/exchange-points/val
// Canjear puntos por VAL
// ============================================================
router.post(
  '/exchange-points/val',
  auth,
  validationMiddleware(ExchangePointsSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { points } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.survivalPoints || user.survivalPoints < points) {
        return res.status(400).json({ error: 'Insufficient survival points' });
      }

      // Realizar canje
      const result = await survivalService.exchangePointsForVal(userId, points);

      user.survivalPoints -= points;
      user.val = (user.val || 0) + result.valGained;
      await user.save();

      return res.status(200).json({
        message: 'Points exchanged for VAL',
        valGained: result.valGained,
        survivalPointsRemaining: user.survivalPoints,
        totalVal: user.val
      });
    } catch (error: any) {
      console.error('Error exchanging points for VAL:', error);
      return res.status(500).json({ error: error.message || 'Failed to exchange points' });
    }
  }
);

// ============================================================
// 9. POST /api/survival/exchange-points/guaranteed-item
// Canjear puntos por item garantizado
// ============================================================
router.post(
  '/exchange-points/guaranteed-item',
  auth,
  validationMiddleware(ExchangeItemSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { points, itemType } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.survivalPoints || user.survivalPoints < points) {
        return res.status(400).json({ error: 'Insufficient survival points' });
      }

      // Realizar canje
      const result = await survivalService.exchangePointsForItem(userId, points, itemType);

      user.survivalPoints -= points;
      if (result.itemType === 'consumable') {
        user.inventarioConsumibles.push(result.item as any);
      } else {
        user.inventarioEquipamiento.push(result.item._id);
      }
      await user.save();

      return res.status(200).json({
        message: 'Points exchanged for guaranteed item',
        item: result.item,
        survivalPointsRemaining: user.survivalPoints
      });
    } catch (error: any) {
      console.error('Error exchanging points for item:', error);
      return res.status(500).json({ error: error.message || 'Failed to exchange points' });
    }
  }
);

// ============================================================
// 10. GET /api/survival/leaderboard
// Obtener leaderboard global de survival
// ============================================================
router.get(
  '/leaderboard',
  auth,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const leaderboard = await survivalService.getLeaderboard(page, limit);

      return res.status(200).json({
        message: 'Leaderboard retrieved',
        leaderboard
      });
    } catch (error: any) {
      console.error('Error getting leaderboard:', error);
      return res.status(500).json({ error: error.message || 'Failed to get leaderboard' });
    }
  }
);

// ============================================================
// 11. GET /api/survival/my-stats
// Obtener estadísticas de survival del usuario
// ============================================================
router.get(
  '/my-stats',
  auth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const stats = await survivalService.getUserStats(userId);

      return res.status(200).json({
        message: 'User stats retrieved',
        stats
      });
    } catch (error: any) {
      console.error('Error getting user stats:', error);
      return res.status(500).json({ error: error.message || 'Failed to get stats' });
    }
  }
);

// ============================================================
// 12. POST /api/survival/:sessionId/abandon
// Abandonar sesión actual
// ============================================================
router.post(
  '/:sessionId/abandon',
  auth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { sessionId } = req.params;

      const session = await SurvivalSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.state !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      // Marcar sesión como abandonada
      session.state = 'abandoned';
      await session.save();

      // Limpiar usuario
      const user = await User.findById(userId);
      if (user) {
        user.currentSurvivalSession = undefined;
        await user.save();
      }

      return res.status(200).json({
        message: 'Session abandoned'
      });
    } catch (error: any) {
      console.error('Error abandoning session:', error);
      return res.status(500).json({ error: error.message || 'Failed to abandon session' });
    }
  }
);

export default router;
