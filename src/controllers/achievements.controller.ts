import { Request, Response } from 'express';
import { Achievement } from '../models/Achievement';
import { User } from '../models/User';
import { isValidObjectId } from 'mongoose';

/**
 * GET /api/achievements
 * Obtiene la lista de todos los logros disponibles (públicos y no ocultos)
 * Query params:
 *   - categoria: 'combate' | 'exploracion' | 'economia' | 'social' | 'hito' | 'oculto'
 *   - dificultad: 'facil' | 'normal' | 'dificil' | 'legendaria'
 *   - seccion: filtrar por sección
 *   - limit: número máximo de resultados (default 50)
 *   - page: página (default 0)
 */
export const listAchievements = async (req: Request, res: Response) => {
  try {
    const { categoria, dificultad, seccion } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 0;
    const skip = page * limit;

    // Construir filtro
    const filter: any = {
      activo: true,
      oculto: false // No mostrar logros ocultos en lista pública
    };

    if (categoria && typeof categoria === 'string') {
      filter.categoria = categoria;
    }

    if (dificultad && typeof dificultad === 'string') {
      filter.dificultad = dificultad;
    }

    if (seccion && typeof seccion === 'string') {
      filter.seccion = seccion;
    }

    // Consultar achievements
    const achievements = await Achievement.find(filter)
      .select('nombre descripcion categoria icono color dificultad seccion recompensas')
      .sort({ seccion: 1, nombre: 1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Contar total
    const total = await Achievement.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      exito: true,
      pagina: page,
      limite: limit,
      total,
      totalPaginas: totalPages,
      logros: achievements.map((ach: any) => ({
        id: ach._id,
        nombre: ach.nombre,
        descripcion: ach.descripcion,
        categoria: ach.categoria,
        icono: ach.icono,
        color: ach.color,
        dificultad: ach.dificultad,
        seccion: ach.seccion,
        recompensas: ach.recompensas
      }))
    });

  } catch (error) {
    console.error('Error al obtener logros:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor al obtener logros'
    });
  }
};

/**
 * GET /api/achievements/:userId
 * Obtiene los logros desbloqueados de un usuario específico
 * Retorna: logros con fecha de desbloqueo
 */
export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validar ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de usuario inválido'
      });
    }

    // Buscar usuario
    const user = await User.findById(userId)
      .select('username logros_desbloqueados')
      .lean();

    if (!user) {
      return res.status(404).json({
        exito: false,
        error: 'Usuario no encontrado'
      });
    }

    // Obtener detalles de logros desbloqueados
    const logrosDesbloqueados = user.logros_desbloqueados || [];

    if (logrosDesbloqueados.length === 0) {
      return res.json({
        exito: true,
        usuarioId: userId,
        nombreUsuario: user.username,
        logrosDesbloqueados: [],
        totalLogros: 0,
        mensaje: 'El usuario aún no ha desbloqueado ningún logro'
      });
    }

    // Buscar detalles de cada logro desbloqueado
    const achievementIds = logrosDesbloqueados.map((l: any) => 
      typeof l === 'object' && l.achievementId ? l.achievementId : l
    );

    const achievements = await Achievement.find({ _id: { $in: achievementIds } })
      .select('nombre descripcion categoria icono color dificultad seccion recompensas')
      .lean();

    // Mapear con fecha de desbloqueo si existe
    const logrosConDetalles = logrosDesbloqueados.map((logro: any) => {
      const achievement = achievements.find(
        (ach: any) => 
          ach._id.toString() === 
          (typeof logro === 'object' && logro.achievementId ? 
            logro.achievementId.toString() : 
            logro.toString())
      );

      if (!achievement) return null;

      return {
        id: achievement._id,
        nombre: achievement.nombre,
        descripcion: achievement.descripcion,
        categoria: achievement.categoria,
        icono: achievement.icono,
        color: achievement.color,
        dificultad: achievement.dificultad,
        seccion: achievement.seccion,
        recompensas: achievement.recompensas,
        fechaDesbloqueo: typeof logro === 'object' && logro.fechaDesbloqueo ? 
          logro.fechaDesbloqueo : 
          null
      };
    }).filter(Boolean); // Filtrar nulos

    // Calcular estadísticas
    const porCategoria = logrosConDetalles.reduce((acc: any, logro: any) => {
      acc[logro.categoria] = (acc[logro.categoria] || 0) + 1;
      return acc;
    }, {});

    const porDificultad = logrosConDetalles.reduce((acc: any, logro: any) => {
      acc[logro.dificultad] = (acc[logro.dificultad] || 0) + 1;
      return acc;
    }, {});

    res.json({
      exito: true,
      usuarioId: userId,
      nombreUsuario: user.username,
      totalLogros: logrosConDetalles.length,
      estadisticas: {
        porCategoria,
        porDificultad,
        porcentajeCompletado: ((logrosConDetalles.length / achievements.length) * 100).toFixed(2) + '%'
      },
      logrosDesbloqueados: logrosConDetalles
    });

  } catch (error) {
    console.error('Error al obtener logros del usuario:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * POST /api/achievements/:userId/unlock
 * Desbloquea un logro para un usuario (interno, solo admin)
 * Body: { achievementId: string }
 */
export const unlockAchievement = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { achievementId } = req.body;

    // Validar ObjectIds
    if (!isValidObjectId(userId) || !isValidObjectId(achievementId)) {
      return res.status(400).json({
        exito: false,
        error: 'IDs inválidos'
      });
    }

    // Verificar que el achievement existe
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({
        exito: false,
        error: 'Logro no encontrado'
      });
    }

    // Actualizar usuario: agregar logro si no lo tiene
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          logros_desbloqueados: {
            achievementId,
            fechaDesbloqueo: new Date()
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        exito: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      exito: true,
      mensaje: `Logro "${achievement.nombre}" desbloqueado para ${user.username}`,
      logro: {
        id: achievement._id,
        nombre: achievement.nombre
      }
    });

  } catch (error) {
    console.error('Error al desbloquear logro:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
};
