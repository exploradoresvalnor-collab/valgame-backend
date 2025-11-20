"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankingStats = exports.getRankingByPeriod = exports.getUserRanking = exports.getGlobalRanking = void 0;
const Ranking_1 = require("../models/Ranking");
const User_1 = require("../models/User");
// Obtener el ranking global (top jugadores)
const getGlobalRanking = async (req, res) => {
    try {
        const { limit = 100, periodo = 'global' } = req.query;
        const rankings = await Ranking_1.Ranking.find({ periodo: periodo })
            .sort({ puntos: -1 })
            .limit(Number(limit))
            .populate('userId', 'username email')
            .lean();
        // Agregar posición en el ranking
        const rankingsWithPosition = rankings.map((ranking, index) => ({
            ...ranking,
            posicion: index + 1
        }));
        return res.json({
            success: true,
            periodo,
            total: rankings.length,
            rankings: rankingsWithPosition
        });
    }
    catch (error) {
        console.error('[GET-RANKING] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener ranking'
        });
    }
};
exports.getGlobalRanking = getGlobalRanking;
// Obtener el ranking de un usuario específico
const getUserRanking = async (req, res) => {
    try {
        const userId = req.userId;
        const { periodo = 'global' } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }
        // Buscar el ranking del usuario
        const userRanking = await Ranking_1.Ranking.findOne({
            userId,
            periodo: periodo
        }).lean();
        if (!userRanking) {
            return res.json({
                success: true,
                ranking: null,
                posicion: null,
                message: 'Aún no tienes estadísticas de ranking. ¡Juega una mazmorra para empezar!'
            });
        }
        // Calcular la posición del usuario
        const betterPlayers = await Ranking_1.Ranking.countDocuments({
            periodo: periodo,
            puntos: { $gt: userRanking.puntos }
        });
        const posicion = betterPlayers + 1;
        // Obtener información del usuario
        const user = await User_1.User.findById(userId, 'username email').lean();
        return res.json({
            success: true,
            ranking: {
                ...userRanking,
                username: user?.username,
                email: user?.email
            },
            posicion,
            periodo
        });
    }
    catch (error) {
        console.error('[GET-USER-RANKING] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener ranking del usuario'
        });
    }
};
exports.getUserRanking = getUserRanking;
// Obtener el ranking por periodo (semanal, mensual)
const getRankingByPeriod = async (req, res) => {
    try {
        const { periodo } = req.params; // Ejemplo: "2025-W45" para semana 45 de 2025
        const { limit = 100 } = req.query;
        const rankings = await Ranking_1.Ranking.find({ periodo })
            .sort({ puntos: -1 })
            .limit(Number(limit))
            .populate('userId', 'username email')
            .lean();
        const rankingsWithPosition = rankings.map((ranking, index) => ({
            ...ranking,
            posicion: index + 1
        }));
        return res.json({
            success: true,
            periodo,
            total: rankings.length,
            rankings: rankingsWithPosition
        });
    }
    catch (error) {
        console.error('[GET-RANKING-BY-PERIOD] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener ranking del periodo'
        });
    }
};
exports.getRankingByPeriod = getRankingByPeriod;
// Obtener estadísticas generales del ranking
const getRankingStats = async (req, res) => {
    try {
        const { periodo = 'global' } = req.query;
        const totalPlayers = await Ranking_1.Ranking.countDocuments({ periodo: periodo });
        const topPlayer = await Ranking_1.Ranking.findOne({ periodo: periodo })
            .sort({ puntos: -1 })
            .populate('userId', 'username')
            .lean();
        const stats = await Ranking_1.Ranking.aggregate([
            { $match: { periodo: periodo } },
            {
                $group: {
                    _id: null,
                    totalPuntos: { $sum: '$puntos' },
                    totalVictorias: { $sum: '$victorias' },
                    totalDerrotas: { $sum: '$derrotas' },
                    totalBoletos: { $sum: '$boletosUsados' },
                    promedioVictorias: { $avg: '$victorias' },
                    promedioPuntos: { $avg: '$puntos' }
                }
            }
        ]);
        return res.json({
            success: true,
            periodo,
            stats: {
                totalPlayers,
                topPlayer: topPlayer ? {
                    username: topPlayer.userId?.username,
                    puntos: topPlayer.puntos,
                    victorias: topPlayer.victorias
                } : null,
                ...stats[0]
            }
        });
    }
    catch (error) {
        console.error('[GET-RANKING-STATS] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas del ranking'
        });
    }
};
exports.getRankingStats = getRankingStats;
