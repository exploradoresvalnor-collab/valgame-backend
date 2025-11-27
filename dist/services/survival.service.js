"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalService = void 0;
const SurvivalSession_1 = require("../models/SurvivalSession");
const SurvivalRun_1 = require("../models/SurvivalRun");
const SurvivalLeaderboard_1 = require("../models/SurvivalLeaderboard");
const User_1 = require("../models/User");
const Item_1 = require("../models/Item");
const mongoose_1 = __importDefault(require("mongoose"));
const survivalMilestones_service_1 = require("./survivalMilestones.service");
class SurvivalService {
    /**
     * 1. Iniciar nueva sesión de survival
     * MEJORADO: Si equipmentIds NO se proporciona, usa el equipamiento actual del personaje
     * Si consumableIds NO se proporciona, usa array vacío
     */
    async startSurvival(userId, characterId, equipmentIds, consumableIds) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user)
                throw new Error('User not found');
            // Obtener personaje
            const character = user.personajes.id(characterId);
            if (!character)
                throw new Error('Character not found');
            // Si NO se proporcionan equipmentIds, usar del personaje
            let finalEquipmentIds;
            if (!equipmentIds || equipmentIds.length === 0) {
                const charEquipamiento = character.equipamiento;
                finalEquipmentIds = charEquipamiento?.map((id) => id.toString()) || [];
                if (finalEquipmentIds.length !== 4) {
                    throw new Error(`Character must have exactly 4 equipped items for Survival. Currently has ${finalEquipmentIds.length}.`);
                }
            }
            else {
                finalEquipmentIds = equipmentIds;
            }
            // Validar que haya exactamente 4 items de equipo
            if (finalEquipmentIds.length !== 4) {
                throw new Error('Equipment must have exactly 4 items');
            }
            // Obtener items del equipo
            const equipment = await Item_1.Item.find({ _id: { $in: finalEquipmentIds } });
            if (equipment.length !== 4) {
                throw new Error('Some equipment items not found');
            }
            // Usar consumableIds proporcionados o array vacío
            const finalConsumableIds = consumableIds || [];
            // Obtener consumibles si existen
            const consumables = finalConsumableIds.length > 0
                ? await Item_1.Item.find({ _id: { $in: finalConsumableIds } })
                : [];
            if (consumables.length !== finalConsumableIds.length) {
                throw new Error('Some consumable items not found');
            }
            // Calcular stats iniciales basado en equipo
            const statsBonus = this.calculateEquipmentBonus(equipment);
            // Mapear equipment IDs a slots (head, body, hands, feet)
            const equipmentObj = {
                head: finalEquipmentIds[0] ? {
                    itemId: new mongoose_1.default.Types.ObjectId(finalEquipmentIds[0]),
                    rareza: 'común',
                    bonusAtaque: 0
                } : undefined,
                body: finalEquipmentIds[1] ? {
                    itemId: new mongoose_1.default.Types.ObjectId(finalEquipmentIds[1]),
                    rareza: 'común',
                    bonusDefensa: 0
                } : undefined,
                hands: finalEquipmentIds[2] ? {
                    itemId: new mongoose_1.default.Types.ObjectId(finalEquipmentIds[2]),
                    rareza: 'común',
                    bonusDefensa: 0
                } : undefined,
                feet: finalEquipmentIds[3] ? {
                    itemId: new mongoose_1.default.Types.ObjectId(finalEquipmentIds[3]),
                    rareza: 'común',
                    bonusVelocidad: 0
                } : undefined
            };
            // Crear sesión
            const session = new SurvivalSession_1.SurvivalSession({
                userId,
                characterId,
                equipment: equipmentObj,
                consumables: finalConsumableIds.map((id) => ({
                    itemId: new mongoose_1.default.Types.ObjectId(id),
                    nombre: 'Consumible',
                    usos_restantes: 3,
                    efecto: {
                        tipo: 'heal',
                        valor: 10
                    }
                })),
                currentWave: 1,
                currentPoints: 0,
                totalPointsAccumulated: 0,
                enemiesDefeated: 0,
                healthCurrent: 100,
                healthMax: 100,
                dropsCollected: [],
                state: 'active',
                multipliers: {
                    waveMultiplier: 1,
                    survivalBonus: 1,
                    equipmentBonus: statsBonus
                },
                actionsLog: [
                    {
                        type: 'session_started',
                        wave: 1,
                        timestamp: new Date(),
                        serverTime: new Date()
                    }
                ],
                startedAt: new Date(),
                lastActionAt: new Date()
            });
            await session.save();
            return session;
        }
        catch (error) {
            throw new Error(`Failed to start survival: ${error.message}`);
        }
    }
    /**
     * 2. Completar una oleada
     */
    async completeWave(sessionId, waveNumber, enemiesDefeated, damageDealt, consumablesUsed = []) {
        try {
            const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
            if (!session)
                throw new Error('Session not found');
            // Anti-cheat: Validar que el número de onda es correcto
            if (waveNumber !== session.currentWave) {
                throw new Error('Invalid wave number');
            }
            // Calcular puntos
            const wavePoints = this.calculateWavePoints(waveNumber, enemiesDefeated, damageDealt, session.multipliers);
            // Actualizar sesión
            session.currentPoints = wavePoints;
            session.totalPointsAccumulated += wavePoints;
            session.enemiesDefeated += enemiesDefeated;
            session.currentWave += 1;
            // Log de acción
            session.actionsLog.push({
                type: 'wave_completed',
                wave: waveNumber,
                timestamp: new Date(),
                serverTime: new Date()
            });
            await session.save();
            return session;
        }
        catch (error) {
            throw new Error(`Failed to complete wave: ${error.message}`);
        }
    }
    /**
     * 3. Usar consumible durante combate
     */
    async useConsumable(sessionId, consumableId, targetSlot) {
        try {
            const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
            if (!session)
                throw new Error('Session not found');
            // Buscar consumible en la sesión
            const consumable = session.consumables.find(c => c.itemId.toString() === consumableId);
            if (!consumable)
                throw new Error('Consumable not found in session');
            if (consumable.usos_restantes <= 0) {
                throw new Error('Consumable has no uses remaining');
            }
            // Obtener item para saber sus efectos
            const item = await Item_1.Item.findById(consumableId);
            if (!item)
                throw new Error('Item not found');
            // Aplicar efecto
            if (targetSlot === 'player') {
                // Curación - Item no tiene propiedades directas, usar defaults
                session.healthCurrent = Math.min(session.healthMax, session.healthCurrent + 10);
            }
            else {
                // Daño al enemigo
                session.currentPoints += 50;
            }
            // Reducir usos
            consumable.usos_restantes -= 1;
            // Log
            session.actionsLog.push({
                type: 'consumable_used',
                wave: session.currentWave,
                timestamp: new Date(),
                serverTime: new Date()
            });
            await session.save();
            return session;
        }
        catch (error) {
            throw new Error(`Failed to use consumable: ${error.message}`);
        }
    }
    /**
     * 4. Recoger drop de enemigo
     */
    async pickupDrop(sessionId, itemId, itemType, itemValue) {
        try {
            const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
            if (!session)
                throw new Error('Session not found');
            if (itemType === 'points') {
                session.currentPoints += itemValue;
                session.totalPointsAccumulated += itemValue;
            }
            else {
                // Resolver datos del item para registrar nombre y rareza
                const itemDoc = await Item_1.Item.findById(itemId);
                session.dropsCollected.push({
                    itemId: new mongoose_1.default.Types.ObjectId(itemId),
                    nombre: itemDoc?.nombre || 'unknown',
                    rareza: itemDoc?.rango || 'D',
                    timestamp: new Date()
                });
            }
            // Log
            session.actionsLog.push({
                type: 'item_pickup',
                wave: session.currentWave,
                timestamp: new Date(),
                serverTime: new Date()
            });
            await session.save();
            return session;
        }
        catch (error) {
            throw new Error(`Failed to pick up drop: ${error.message}`);
        }
    }
    /**
     * 5. Terminar sesión exitosamente
     */
    async endSurvival(userId, sessionId, finalWave, totalEnemiesDefeated, totalPoints, duration) {
        try {
            const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
            if (!session)
                throw new Error('Session not found');
            // Anti-cheat: Validar lógica
            if (finalWave < 1 || totalPoints < 0 || duration < 0) {
                throw new Error('Invalid run data');
            }
            // Calcular recompensas
            const experienceGained = this.calculateExperience(finalWave, totalPoints);
            const valGained = this.calculateVAL(finalWave, totalPoints);
            // Crear run histórico
            const run = new SurvivalRun_1.SurvivalRun({
                userId,
                characterId: session.characterId,
                finalWave,
                finalPoints: totalPoints,
                totalEnemiesDefeated,
                itemsObtained: session.dropsCollected,
                rewards: {
                    expGained: experienceGained,
                    valGained,
                    pointsAvailable: totalPoints
                },
                equipmentUsed: session.equipment,
                startedAt: session.startedAt,
                completedAt: new Date(),
                duration
            });
            await run.save();
            // Marcar sesión como completada
            session.state = 'completed';
            session.completedAt = new Date();
            await session.save();
            // Aplicar recompensas por hitos (si el escenario define alguno)
            try {
                await survivalMilestones_service_1.SurvivalMilestonesService.applyForRun(userId, sessionId, run._id.toString(), finalWave, totalPoints);
            }
            catch (e) {
                // No interrumpir el flujo principal si falla la aplicación de hitos
                console.error('Failed to apply survival milestones:', e?.message || e);
            }
            return run;
        }
        catch (error) {
            throw new Error(`Failed to end survival: ${error.message}`);
        }
    }
    /**
     * 6. Reportar muerte del jugador
     */
    async reportDeath(userId, sessionId, waveAtDeath, pointsAtDeath) {
        try {
            const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
            if (!session)
                throw new Error('Session not found');
            // Crear run con derrota (sin recompensas)
            const run = new SurvivalRun_1.SurvivalRun({
                userId,
                characterId: session.characterId,
                finalWave: waveAtDeath,
                finalPoints: pointsAtDeath,
                totalEnemiesDefeated: session.enemiesDefeated,
                itemsObtained: session.dropsCollected,
                rewards: {
                    expGained: 0,
                    valGained: 0,
                    pointsAvailable: 0
                },
                equipmentUsed: session.equipment,
                startedAt: session.startedAt,
                completedAt: new Date(),
                duration: new Date().getTime() - new Date(session.startedAt).getTime()
            });
            await run.save();
            // Marcar sesión como abandonada
            session.state = 'abandoned';
            session.completedAt = new Date();
            await session.save();
            return run;
        }
        catch (error) {
            throw new Error(`Failed to report death: ${error.message}`);
        }
    }
    /**
     * 7. Canjear puntos por experiencia
     */
    async exchangePointsForExp(userId, points) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user)
                throw new Error('User not found');
            const experienceGained = points * 10; // 10 XP por cada punto
            // Actualizar personaje activo con experiencia
            if (user.personajeActivoId) {
                const character = user.personajes.id(user.personajeActivoId);
                if (character) {
                    character.experiencia = (character.experiencia || 0) + experienceGained;
                    await user.save();
                }
            }
            return { experienceGained };
        }
        catch (error) {
            throw new Error(`Failed to exchange points for exp: ${error.message}`);
        }
    }
    /**
     * 8. Canjear puntos por VAL
     */
    async exchangePointsForVal(userId, points) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user)
                throw new Error('User not found');
            const valGained = Math.floor(points * 0.5); // 0.5 VAL por cada punto
            return { valGained };
        }
        catch (error) {
            throw new Error(`Failed to exchange points for VAL: ${error.message}`);
        }
    }
    /**
     * 9. Canjear puntos por item garantizado
     */
    async exchangePointsForItem(userId, points, itemType) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user)
                throw new Error('User not found');
            // Crear item basado en tipo
            const newItem = await this.generateGuaranteedItem(itemType);
            return { item: newItem, itemType };
        }
        catch (error) {
            throw new Error(`Failed to exchange points for item: ${error.message}`);
        }
    }
    /**
     * 10. Obtener leaderboard global
     */
    async getLeaderboard(page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;
            const leaderboard = await SurvivalLeaderboard_1.SurvivalLeaderboard.find()
                .sort({ maxWave: -1, totalPoints: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            return leaderboard;
        }
        catch (error) {
            throw new Error(`Failed to get leaderboard: ${error.message}`);
        }
    }
    /**
     * 11. Obtener estadísticas del usuario
     */
    async getUserStats(userId) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user)
                throw new Error('User not found');
            const leaderboardEntry = await SurvivalLeaderboard_1.SurvivalLeaderboard.findOne({ userId });
            const runs = await SurvivalRun_1.SurvivalRun.find({ userId })
                .sort({ completedAt: -1 })
                .limit(10);
            return {
                userId,
                survivalPoints: user.survivalPoints || 0,
                stats: user.survivalStats || { totalRuns: 0, maxWave: 0, totalPoints: 0, averageWave: 0 },
                leaderboardRank: leaderboardEntry?.rankingPosition || null,
                recentRuns: runs,
                currentSession: user.currentSurvivalSession ? await SurvivalSession_1.SurvivalSession.findById(user.currentSurvivalSession) : null
            };
        }
        catch (error) {
            throw new Error(`Failed to get user stats: ${error.message}`);
        }
    }
    /**
     * Actualizar leaderboard después de completar sesión
     */
    async updateLeaderboard(userId, maxWave, totalPoints, topRunId) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user)
                throw new Error('User not found');
            let leaderboardEntry = await SurvivalLeaderboard_1.SurvivalLeaderboard.findOne({ userId });
            if (!leaderboardEntry) {
                leaderboardEntry = new SurvivalLeaderboard_1.SurvivalLeaderboard({
                    userId,
                    username: user.username,
                    characterName: user.personajeActivoId
                        ? user.personajes.id(user.personajeActivoId)?.personajeId || 'Unknown'
                        : 'Unknown',
                    totalRuns: 1,
                    maxWave,
                    totalPoints,
                    topRunId,
                    pointsAvailable: user.survivalPoints || 0
                });
            }
            else {
                leaderboardEntry.totalRuns = (leaderboardEntry.totalRuns || 0) + 1;
                leaderboardEntry.maxWave = Math.max(leaderboardEntry.maxWave || 0, maxWave);
                leaderboardEntry.totalPoints = (leaderboardEntry.totalPoints || 0) + totalPoints;
                leaderboardEntry.topRunId = new mongoose_1.default.Types.ObjectId(topRunId);
                leaderboardEntry.pointsAvailable = user.survivalPoints || 0;
            }
            await leaderboardEntry.save();
            // Actualizar ranking
            await this.updateRankingPositions();
        }
        catch (error) {
            throw new Error(`Failed to update leaderboard: ${error.message}`);
        }
    }
    /**
     * MÉTODOS AUXILIARES
     */
    calculateEquipmentBonus(equipment) {
        let bonus = 1;
        equipment.forEach(item => {
            if (item.mejora_atk)
                bonus *= (1 + item.mejora_atk / 100);
            if (item.mejora_defensa)
                bonus *= (1 + item.mejora_defensa / 100);
        });
        return bonus;
    }
    calculateWavePoints(waveNumber, enemiesDefeated, damageDealt, multipliers) {
        const basePoints = waveNumber * 10;
        const enemyBonus = enemiesDefeated * 5;
        const damageBonus = Math.floor(damageDealt / 10);
        const totalMultiplier = multipliers.waveMultiplier *
            multipliers.survivalBonus *
            multipliers.equipmentBonus;
        return Math.floor((basePoints + enemyBonus + damageBonus) * totalMultiplier);
    }
    calculateExperience(finalWave, totalPoints) {
        return (finalWave * 100) + (totalPoints * 5);
    }
    calculateVAL(finalWave, totalPoints) {
        return Math.floor((finalWave * 10) + (totalPoints * 0.1));
    }
    async generateGuaranteedItem(itemType) {
        // Generar item basado en tipo
        // Este es un stub - implementar lógica de generación de items
        return {
            type: itemType,
            generated: true
        };
    }
    async updateRankingPositions() {
        const leaderboard = await SurvivalLeaderboard_1.SurvivalLeaderboard.find()
            .sort({ maxWave: -1, totalPoints: -1 })
            .exec();
        for (let i = 0; i < leaderboard.length; i++) {
            leaderboard[i].rankingPosition = i + 1;
            await leaderboard[i].save();
        }
    }
}
exports.SurvivalService = SurvivalService;
