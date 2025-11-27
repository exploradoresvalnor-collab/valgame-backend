"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middlewares/auth");
const survival_service_1 = require("../services/survival.service");
const User_1 = require("../models/User");
const SurvivalSession_1 = require("../models/SurvivalSession");
const router = (0, express_1.Router)();
const survivalService = new survival_service_1.SurvivalService();
// Middleware de validación
const validationMiddleware = (schema) => (req, res, next) => {
    try {
        const validated = schema.parse(req.body);
        req.body = validated;
        next();
    }
    catch (error) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.errors
        });
    }
};
// Esquemas de validación Zod
// MEJORADO: equipmentIds y consumableIds ahora son opcionales
// Si no se proporcionan, se usan los del personaje automáticamente
const StartSurvivalSchema = zod_1.z.object({
    characterId: zod_1.z.string().min(1),
    equipmentIds: zod_1.z.array(zod_1.z.string()).length(4).optional(), // Opcional: si no se proporciona, se usa del personaje
    consumableIds: zod_1.z.array(zod_1.z.string()).max(5).optional() // Opcional: por defecto array vacío
});
const CompleteWaveSchema = zod_1.z.object({
    waveNumber: zod_1.z.number().min(1),
    enemiesDefeated: zod_1.z.number().min(1),
    damageDealt: zod_1.z.number().min(0),
    consumablesUsed: zod_1.z.array(zod_1.z.string()).optional()
});
const UseConsumableSchema = zod_1.z.object({
    consumableId: zod_1.z.string().min(1),
    targetSlot: zod_1.z.enum(['player', 'enemy']).optional()
});
const PickupDropSchema = zod_1.z.object({
    itemId: zod_1.z.string().min(1),
    itemType: zod_1.z.enum(['equipment', 'consumable', 'points']),
    itemValue: zod_1.z.number().min(0).optional()
});
const EndSessionSchema = zod_1.z.object({
    finalWave: zod_1.z.number().min(1),
    totalEnemiesDefeated: zod_1.z.number().min(0),
    totalPoints: zod_1.z.number().min(0),
    duration: zod_1.z.number().min(0)
});
const ExchangePointsSchema = zod_1.z.object({
    points: zod_1.z.number().min(1)
});
const ExchangeItemSchema = zod_1.z.object({
    points: zod_1.z.number().min(1),
    itemType: zod_1.z.enum(['helmet', 'armor', 'gloves', 'boots', 'consumable'])
});
// ============================================================
// 1. POST /api/survival/start
// Iniciar nueva sesión de survival
// MEJORADO: equipmentIds y consumableIds son OPCIONALES
// - Si NO se envían equipmentIds: usa el equipamiento del personaje
// - Si NO se envían consumableIds: inicia sin consumibles
// ============================================================
router.post('/start', auth_1.auth, validationMiddleware(StartSurvivalSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { characterId, equipmentIds, consumableIds } = req.body;
        // Verificar que el usuario existe
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verificar que el personaje existe y pertenece al usuario
        const character = user.personajes.id(characterId);
        if (!character) {
            return res.status(400).json({ error: 'Character not found' });
        }
        // Crear nueva sesión (equipmentIds y consumableIds son opcionales)
        const session = await survivalService.startSurvival(userId, characterId, equipmentIds, // undefined si no se proporciona
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
    }
    catch (error) {
        console.error('Error starting survival:', error);
        return res.status(500).json({ error: error.message || 'Failed to start survival' });
    }
});
// ============================================================
// 2. POST /api/survival/:sessionId/complete-wave
// Completar una oleada
// ============================================================
router.post('/:sessionId/complete-wave', auth_1.auth, validationMiddleware(CompleteWaveSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const { waveNumber, enemiesDefeated, damageDealt, consumablesUsed } = req.body;
        // Verificar que la sesión existe y pertenece al usuario
        const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
        if (!session || session.userId.toString() !== userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        // Anti-cheat: Validar que la onda está activa
        if (session.state !== 'active') {
            return res.status(400).json({ error: 'Session is not active' });
        }
        // Completar onda
        const updatedSession = await survivalService.completeWave(sessionId, waveNumber, enemiesDefeated, damageDealt, consumablesUsed || []);
        return res.status(200).json({
            message: 'Wave completed',
            session: updatedSession
        });
    }
    catch (error) {
        console.error('Error completing wave:', error);
        return res.status(500).json({ error: error.message || 'Failed to complete wave' });
    }
});
// ============================================================
// 3. POST /api/survival/:sessionId/use-consumable
// Usar consumible durante el combate
// ============================================================
router.post('/:sessionId/use-consumable', auth_1.auth, validationMiddleware(UseConsumableSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const { consumableId, targetSlot } = req.body;
        const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
        if (!session || session.userId.toString() !== userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.state !== 'active') {
            return res.status(400).json({ error: 'Session is not active' });
        }
        const updatedSession = await survivalService.useConsumable(sessionId, consumableId, targetSlot || 'player');
        return res.status(200).json({
            message: 'Consumable used',
            session: updatedSession
        });
    }
    catch (error) {
        console.error('Error using consumable:', error);
        return res.status(500).json({ error: error.message || 'Failed to use consumable' });
    }
});
// ============================================================
// 4. POST /api/survival/:sessionId/pickup-drop
// Recoger drop de enemigo
// ============================================================
router.post('/:sessionId/pickup-drop', auth_1.auth, validationMiddleware(PickupDropSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const { itemId, itemType, itemValue } = req.body;
        const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
        if (!session || session.userId.toString() !== userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.state !== 'active') {
            return res.status(400).json({ error: 'Session is not active' });
        }
        const updatedSession = await survivalService.pickupDrop(sessionId, itemId, itemType, itemValue || 0);
        return res.status(200).json({
            message: 'Drop picked up',
            session: updatedSession
        });
    }
    catch (error) {
        console.error('Error picking up drop:', error);
        return res.status(500).json({ error: error.message || 'Failed to pick up drop' });
    }
});
// ============================================================
// 5. POST /api/survival/:sessionId/end
// Terminar sesión exitosamente
// ============================================================
router.post('/:sessionId/end', auth_1.auth, validationMiddleware(EndSessionSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const { finalWave, totalEnemiesDefeated, totalPoints, duration } = req.body;
        const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
        if (!session || session.userId.toString() !== userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.state !== 'active') {
            return res.status(400).json({ error: 'Session is not active' });
        }
        // Crear run histórico
        const run = await survivalService.endSurvival(userId, sessionId, finalWave, totalEnemiesDefeated, totalPoints, duration);
        // Actualizar usuario
        const user = await User_1.User.findById(userId);
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
    }
    catch (error) {
        console.error('Error ending session:', error);
        return res.status(500).json({ error: error.message || 'Failed to end session' });
    }
});
// ============================================================
// 6. POST /api/survival/:sessionId/death
// Reportar muerte del jugador
// ============================================================
router.post('/:sessionId/death', auth_1.auth, async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
        if (!session || session.userId.toString() !== userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.state !== 'active') {
            return res.status(400).json({ error: 'Session is not active' });
        }
        // Crear run con derrota
        const run = await survivalService.reportDeath(userId, sessionId, session.currentWave, session.currentPoints);
        // Actualizar usuario
        const user = await User_1.User.findById(userId);
        if (user) {
            user.currentSurvivalSession = undefined;
            await user.save();
        }
        return res.status(200).json({
            message: 'Death reported',
            run,
            rewards: { experience: 0, val: 0, points: 0 }
        });
    }
    catch (error) {
        console.error('Error reporting death:', error);
        return res.status(500).json({ error: error.message || 'Failed to report death' });
    }
});
// ============================================================
// 7. POST /api/survival/exchange-points/exp
// Canjear puntos por experiencia
// ============================================================
router.post('/exchange-points/exp', auth_1.auth, validationMiddleware(ExchangePointsSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { points } = req.body;
        const user = await User_1.User.findById(userId);
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
    }
    catch (error) {
        console.error('Error exchanging points:', error);
        return res.status(500).json({ error: error.message || 'Failed to exchange points' });
    }
});
// ============================================================
// 8. POST /api/survival/exchange-points/val
// Canjear puntos por VAL
// ============================================================
router.post('/exchange-points/val', auth_1.auth, validationMiddleware(ExchangePointsSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { points } = req.body;
        const user = await User_1.User.findById(userId);
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
    }
    catch (error) {
        console.error('Error exchanging points for VAL:', error);
        return res.status(500).json({ error: error.message || 'Failed to exchange points' });
    }
});
// ============================================================
// 9. POST /api/survival/exchange-points/guaranteed-item
// Canjear puntos por item garantizado
// ============================================================
router.post('/exchange-points/guaranteed-item', auth_1.auth, validationMiddleware(ExchangeItemSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { points, itemType } = req.body;
        const user = await User_1.User.findById(userId);
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
            user.inventarioConsumibles.push(result.item);
        }
        else {
            user.inventarioEquipamiento.push(result.item._id);
        }
        await user.save();
        return res.status(200).json({
            message: 'Points exchanged for guaranteed item',
            item: result.item,
            survivalPointsRemaining: user.survivalPoints
        });
    }
    catch (error) {
        console.error('Error exchanging points for item:', error);
        return res.status(500).json({ error: error.message || 'Failed to exchange points' });
    }
});
// ============================================================
// 10. GET /api/survival/leaderboard
// Obtener leaderboard global de survival
// ============================================================
router.get('/leaderboard', auth_1.auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = await survivalService.getLeaderboard(page, limit);
        return res.status(200).json({
            message: 'Leaderboard retrieved',
            leaderboard
        });
    }
    catch (error) {
        console.error('Error getting leaderboard:', error);
        return res.status(500).json({ error: error.message || 'Failed to get leaderboard' });
    }
});
// ============================================================
// 11. GET /api/survival/my-stats
// Obtener estadísticas de survival del usuario
// ============================================================
router.get('/my-stats', auth_1.auth, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const stats = await survivalService.getUserStats(userId);
        return res.status(200).json({
            message: 'User stats retrieved',
            stats
        });
    }
    catch (error) {
        console.error('Error getting user stats:', error);
        return res.status(500).json({ error: error.message || 'Failed to get stats' });
    }
});
// ============================================================
// 12. POST /api/survival/:sessionId/abandon
// Abandonar sesión actual
// ============================================================
router.post('/:sessionId/abandon', auth_1.auth, async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
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
        const user = await User_1.User.findById(userId);
        if (user) {
            user.currentSurvivalSession = undefined;
            await user.save();
        }
        return res.status(200).json({
            message: 'Session abandoned'
        });
    }
    catch (error) {
        console.error('Error abandoning session:', error);
        return res.status(500).json({ error: error.message || 'Failed to abandon session' });
    }
});
exports.default = router;
