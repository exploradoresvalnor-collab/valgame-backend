"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalMilestonesService = void 0;
const SurvivalScenario_1 = require("../models/SurvivalScenario");
const SurvivalSession_1 = require("../models/SurvivalSession");
const SurvivalRun_1 = require("../models/SurvivalRun");
const User_1 = require("../models/User");
const Item_1 = require("../models/Item");
const realtime_service_1 = require("./realtime.service");
class SurvivalMilestonesService {
    /**
     * Aplica recompensas por hitos al finalizar una run (modo single-player).
     * - userId: id del usuario
     * - sessionId: id de la sesión
     * - runId: id del run (registro histórico)
     * - finalWave, totalPoints: métricas finales
     */
    static async applyForRun(userId, sessionId, runId, finalWave, totalPoints) {
        try {
            const session = await SurvivalSession_1.SurvivalSession.findById(sessionId);
            const run = await SurvivalRun_1.SurvivalRun.findById(runId);
            const user = await User_1.User.findById(userId);
            if (!user || !run || !session)
                return;
            const scenarioSlug = session.scenarioSlug || 'basico-castillo';
            const scenario = await SurvivalScenario_1.SurvivalScenario.findOne({ slug: scenarioSlug });
            if (!scenario)
                return;
            // Determinar hitos alcanzados
            const achieved = scenario.milestoneRewards
                .filter(m => m.milestone <= finalWave)
                .sort((a, b) => a.milestone - b.milestone);
            const details = [];
            let totalExp = 0;
            let totalVal = 0;
            for (const m of achieved) {
                const reward = m.rewards || { exp: 0, val: 0, items: [] };
                // Aplicar EXP al personaje activo
                if (user.personajeActivoId) {
                    const character = user.personajes.id(user.personajeActivoId);
                    if (character) {
                        character.experiencia = (character.experiencia || 0) + (reward.exp || 0);
                    }
                }
                // Aplicar VAL al usuario
                user.val = (user.val || 0) + (reward.val || 0);
                // Añadir items al inventario (heurística por nombre)
                const itemsApplied = [];
                if (Array.isArray(reward.items)) {
                    for (const it of reward.items) {
                        const found = await Item_1.Item.findOne({ nombre: it.nombre });
                        if (found) {
                            // Si es consumable, añadir al inventarioConsumibles
                            // Intentamos inferir tipo por discriminador `tipoItem`
                            const tipo = found.tipoItem || '';
                            if (tipo.toLowerCase().includes('consum')) {
                                user.inventarioConsumibles.push({ consumableId: found._id, usos_restantes: it.cantidad || 1 });
                            }
                            else {
                                // Añadir N veces al inventarioEquipamiento
                                for (let i = 0; i < (it.cantidad || 1); i++) {
                                    user.inventarioEquipamiento.push(found._id);
                                }
                            }
                            itemsApplied.push({ itemId: found._id, nombre: found.nombre, cantidad: it.cantidad || 1 });
                        }
                    }
                }
                details.push({ milestoneNumber: m.milestone, rewards: { exp: reward.exp || 0, val: reward.val || 0, items: itemsApplied }, appliedAt: new Date() });
                totalExp += reward.exp || 0;
                totalVal += reward.val || 0;
            }
            // Actualizar puntos de survival (fórmula simple)
            const survivalPointsGain = Math.floor(totalExp / 100) + Math.floor(totalVal / 50);
            user.survivalPoints = (user.survivalPoints || 0) + survivalPointsGain;
            // Persistir cambios en usuario
            await user.save();
            // Registrar detalle en run
            run.milestoneDetails = details;
            // Guardar el scenarioSlug por trazabilidad
            run.scenarioSlug = scenarioSlug;
            await run.save();
            // Emitir notificaciones en realtime (si está inicializado)
            try {
                const realtime = realtime_service_1.RealtimeService.getInstance();
                realtime.notifyReward(userId, { totalExp, totalVal, details });
                realtime.notifyInventoryUpdate(userId, { inventarioEquipamiento: user.inventarioEquipamiento.length, inventarioConsumibles: user.inventarioConsumibles.length });
            }
            catch (e) {
                // Silenciar si no hay servicio inyectado
            }
        }
        catch (error) {
            console.error('Error applying survival milestones:', error?.message || error);
        }
    }
}
exports.SurvivalMilestonesService = SurvivalMilestonesService;
