"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboardByCategory = exports.getRankingStats = exports.getRankingByPeriod = exports.getUserRanking = exports.getGlobalRanking = void 0;
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
// Función para obtener rankings por categoría
const getLeaderboardByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const skip = page * limit;
        // Validar categoría
        const validCategories = ['level', 'wins', 'winrate', 'wealth'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: `Categoría inválida. Válidas: ${validCategories.join(', ')}`
            });
        }
        // Importar User model
        const { User } = require('../models/User');
        // Construir pipeline de agregación según categoría
        let sortField = {};
        let projection = {
            _id: 1,
            nombre: 1,
            dungeon_stats: 1,
            dungeon_streak: 1,
            valBalance: 1,
            personajes: 1
        };
        switch (category) {
            case 'level':
                // Ordenar por nivel máximo de personajes
                sortField = { 'maxNivel': -1 };
                break;
            case 'wins':
                // Ordenar por total de victorias
                sortField = { 'dungeon_stats.total_victorias': -1 };
                break;
            case 'winrate':
                // Ordenar por winrate (victorias / (victorias + derrotas))
                sortField = { 'winrate': -1 };
                break;
            case 'wealth':
                // Ordenar por VAL acumulado
                sortField = { 'valBalance': -1 };
                break;
        }
        // Ejecutar agregación
        const users = await User.aggregate([
            // Stage 1: Obtener máximo nivel de personajes
            {
                $addFields: {
                    maxNivel: {
                        $cond: [
                            { $gt: [{ $size: '$personajes' }, 0] },
                            { $max: '$personajes.nivel' },
                            1
                        ]
                    }
                }
            },
            // Stage 2: Calcular winrate
            {
                $addFields: {
                    totalCombates: {
                        $add: [
                            { $ifNull: ['$dungeon_stats.total_victorias', 0] },
                            { $ifNull: ['$dungeon_stats.total_derrotas', 0] }
                        ]
                    },
                    winrate: {
                        $cond: [
                            {
                                $gt: [
                                    {
                                        $add: [
                                            { $ifNull: ['$dungeon_stats.total_victorias', 0] },
                                            { $ifNull: ['$dungeon_stats.total_derrotas', 0] }
                                        ]
                                    },
                                    0
                                ]
                            },
                            {
                                $divide: [
                                    { $ifNull: ['$dungeon_stats.total_victorias', 0] },
                                    {
                                        $add: [
                                            { $ifNull: ['$dungeon_stats.total_victorias', 0] },
                                            { $ifNull: ['$dungeon_stats.total_derrotas', 0] }
                                        ]
                                    }
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            // Stage 3: Ordenar según categoría
            { $sort: sortField },
            // Stage 4: Contar total
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                nombre: 1,
                                posicion: { $add: [skip, 1] }, // Posición en el ranking
                                stats: {
                                    nivel: '$maxNivel',
                                    victorias: { $ifNull: ['$dungeon_stats.total_victorias', 0] },
                                    derrotas: { $ifNull: ['$dungeon_stats.total_derrotas', 0] },
                                    racha: { $ifNull: ['$dungeon_streak', 0] },
                                    val: { $ifNull: ['$valBalance', 0] },
                                    winrate: {
                                        $multiply: [
                                            {
                                                $round: ['$winrate', 4]
                                            },
                                            100
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);
        const total = users[0].metadata[0]?.total || 0;
        const data = users[0].data;
        // Agregar número de página y total de páginas
        const totalPages = Math.ceil(total / limit);
        res.json({
            categoria: category,
            pagina: page,
            limite: limit,
            total,
            totalPages,
            usuarios: data.map((user, index) => ({
                posicion: page * limit + index + 1,
                userId: user._id,
                nombre: user.nombre,
                stats: user.stats
            }))
        });
    }
    catch (error) {
        console.error('Error al obtener leaderboard:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.getLeaderboardByCategory = getLeaderboardByCategory;
