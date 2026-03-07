import { Request, Response } from 'express';
import UserCharacter from '../models/userCharacter';

// Función auxiliar para modo desarrollo
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function getDevUserCharacters(userId: string) {
  return [
    {
      _id: '507f1f77bcf86cd799439012',
      personajeId: 'dev_char_001',
      nombre: 'Héroe de Desarrollo',
      rango: 'D',
      nivel: 5,
      etapa: 1,
      experiencia: 100,
      stats: {
        salud: 100,
        ataque: 20,
        defensa: 15
      },
      saludActual: 100
    },
    {
      _id: '507f1f77bcf86cd799439013',
      personajeId: 'dev_char_002',
      nombre: 'Guerrero de Desarrollo',
      rango: 'C',
      nivel: 10,
      etapa: 1,
      experiencia: 500,
      stats: {
        salud: 150,
        ataque: 30,
        defensa: 25
      },
      saludActual: 150
    },
    {
      _id: '507f1f77bcf86cd799439014',
      personajeId: 'dev_char_003',
      nombre: 'Mago de Desarrollo',
      rango: 'B',
      nivel: 15,
      etapa: 1,
      experiencia: 1200,
      stats: {
        salud: 120,
        ataque: 40,
        defensa: 20
      },
      saludActual: 120
    }
  ];
}

// GET /api/user-characters - Obtener todos los personajes del usuario
export const getUserCharacters = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || req.user?.userId;
    console.log('[DEV-DEBUG] getUserCharacters - userId:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (isDevelopmentMode()) {
      // Modo desarrollo: devolver personajes ficticios
      const characters = getDevUserCharacters(userId);
      console.log('[DEV-DEBUG] Returning dev characters:', characters.length);
      return res.json({
        success: true,
        characters: characters
      });
    }

    // Modo producción: lógica original
    // Obtener personajes del usuario con información completa
    const characters = await UserCharacter.find({ userId })
      .populate('baseCharacterId', 'name description stats')
      .populate('equipment.weapon', 'name stats')
      .populate('equipment.armor', 'name stats')
      .populate('equipment.accessory', 'name stats')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      characters: characters
    });
  } catch (error: any) {
    console.error('[GET-USER-CHARACTERS] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener personajes del usuario'
    });
  }
};

// GET /api/user-characters/:id - Obtener personaje específico del usuario
export const getUserCharacterById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const character = await UserCharacter.findOne({ _id: id, userId })
      .populate('baseCharacterId', 'name description stats')
      .populate('equipment.weapon', 'name stats')
      .populate('equipment.armor', 'name stats')
      .populate('equipment.accessory', 'name stats');

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Personaje no encontrado'
      });
    }

    return res.json({
      success: true,
      data: character
    });
  } catch (error: any) {
    console.error('[GET-USER-CHARACTER-BY-ID] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener personaje'
    });
  }
};