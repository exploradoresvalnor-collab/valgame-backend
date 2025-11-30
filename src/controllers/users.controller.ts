import { Request, Response } from 'express';
import { User } from '../models/User';
import { isValidObjectId } from 'mongoose';

/**
 * GET /api/user/profile/:userId
 * Obtiene el perfil público de un usuario específico
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validar ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        exito: false,
        error: 'ID de usuario inválido' 
      });
    }

    // Buscar el usuario
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ 
        exito: false,
        error: 'Usuario no encontrado' 
      });
    }

    // Calcular estadísticas generales
    const totalPersonajes = user.personajes ? user.personajes.length : 0;
    const personajesPrincipales = user.personajes ? user.personajes.filter((p: any) => p.nivel >= 10).length : 0;

    // Obtener nivel máximo entre todos los personajes
    const maxNivel = user.personajes && user.personajes.length > 0
      ? Math.max(...user.personajes.map((p: any) => p.nivel || 1))
      : 1;

    // Obtener experiencia total (suma de todos los personajes)
    const totalExperiencia = user.personajes && user.personajes.length > 0
      ? user.personajes.reduce((sum: number, p: any) => sum + (p.experiencia || 0), 0)
      : 0;

    // Mascara email para privacidad
    const emailMasked = user.email 
      ? user.email.substring(0, 3) + '***' + user.email.substring(user.email.indexOf('@') - 1)
      : 'No disponible';

    // Retornar perfil del usuario
    res.json({
      exito: true,
      usuarioId: user._id,
      nombre: user.username,
      emailMasked,
      fechaRegistro: user.fechaRegistro,

      // Estadísticas generales
      estadisticas: {
        totalPersonajes,
        personajesPrincipales,
        nivelMaximo: maxNivel,
        experienciaTotal: totalExperiencia
      },

      // Estadísticas de combate
      combate: {
        victorias: user.dungeon_stats?.total_victorias || 0,
        derrotas: user.dungeon_stats?.total_derrotas || 0,
        rachaActual: user.dungeon_streak || 0,
        rachaMaxima: user.max_dungeon_streak || 0
      },

      // Recursos
      recursos: {
        val: user.val || 0,
        boletos: user.boletos || 0,
        energia: user.energia || 100
      },

      // Información de personajes resumida (primeros 5)
      personajes: user.personajes && user.personajes.length > 0
        ? user.personajes.slice(0, 5).map((p: any) => ({
            personajeId: p.personajeId,
            rango: p.rango || 'D',
            nivel: p.nivel || 1,
            experiencia: p.experiencia || 0,
            saludActual: p.saludActual || 0,
            saludMaxima: p.saludMaxima || 100,
            estado: p.estado || 'saludable'
          }))
        : [],

      // Información de logros desbloqueados
      logros: {
        total: user.logros_desbloqueados ? user.logros_desbloqueados.length : 0,
        desbloqueados: user.logros_desbloqueados ? user.logros_desbloqueados.length : 0
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({ 
      exito: false,
      error: 'Error interno del servidor' 
    });
  }
};
