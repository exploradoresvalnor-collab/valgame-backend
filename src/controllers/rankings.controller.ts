import { Request, Response } from 'express';
import { Ranking } from '../models/Ranking';
import { User } from '../models/User';

interface AuthRequest extends Request {
  userId?: string;
}

// Obtener el ranking global (top jugadores)
export const getGlobalRanking = async (req: Request, res: Response) => {
  try {
    const { limit = 100, periodo = 'global' } = req.query;

    const rankings = await Ranking.find({ periodo: periodo as string })
      .sort({ puntos: -1 })
      .limit(Number(limit))
      .populate('userId', 'username email')
      .lean();

    // Agregar posición en el ranking
    const rankingsWithPosition = rankings.map((ranking: any, index: number) => ({
      ...ranking,
      posicion: index + 1
    }));

    return res.json({
      success: true,
      periodo,
      total: rankings.length,
      rankings: rankingsWithPosition
    });
  } catch (error: any) {
    console.error('[GET-RANKING] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al obtener ranking' 
    });
  }
};

// Obtener el ranking de un usuario específico
export const getUserRanking = async (req: AuthRequest, res: Response) => {
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
    const userRanking = await Ranking.findOne({ 
      userId, 
      periodo: periodo as string 
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
    const betterPlayers = await Ranking.countDocuments({
      periodo: periodo as string,
      puntos: { $gt: userRanking.puntos }
    });

    const posicion = betterPlayers + 1;

    // Obtener información del usuario
    const user = await User.findById(userId, 'username email').lean();

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
  } catch (error: any) {
    console.error('[GET-USER-RANKING] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al obtener ranking del usuario' 
    });
  }
};

// Obtener el ranking por periodo (semanal, mensual)
export const getRankingByPeriod = async (req: Request, res: Response) => {
  try {
    const { periodo } = req.params; // Ejemplo: "2025-W45" para semana 45 de 2025
    const { limit = 100 } = req.query;

    const rankings = await Ranking.find({ periodo })
      .sort({ puntos: -1 })
      .limit(Number(limit))
      .populate('userId', 'username email')
      .lean();

    const rankingsWithPosition = rankings.map((ranking: any, index: number) => ({
      ...ranking,
      posicion: index + 1
    }));

    return res.json({
      success: true,
      periodo,
      total: rankings.length,
      rankings: rankingsWithPosition
    });
  } catch (error: any) {
    console.error('[GET-RANKING-BY-PERIOD] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al obtener ranking del periodo' 
    });
  }
};

// Obtener estadísticas generales del ranking
export const getRankingStats = async (req: Request, res: Response) => {
  try {
    const { periodo = 'global' } = req.query;

    const totalPlayers = await Ranking.countDocuments({ periodo: periodo as string });
    
    const topPlayer = await Ranking.findOne({ periodo: periodo as string })
      .sort({ puntos: -1 })
      .populate('userId', 'username')
      .lean();

    const stats = await Ranking.aggregate([
      { $match: { periodo: periodo as string } },
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
          username: (topPlayer.userId as any)?.username,
          puntos: topPlayer.puntos,
          victorias: topPlayer.victorias
        } : null,
        ...stats[0]
      }
    });
  } catch (error: any) {
    console.error('[GET-RANKING-STATS] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas del ranking' 
    });
  }
};
