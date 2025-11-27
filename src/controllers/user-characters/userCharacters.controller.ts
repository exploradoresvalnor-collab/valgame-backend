import { Request, Response } from 'express';
import UserCharacter from '../../models/userCharacter';

// GET /api/user-characters - Obtener todos los personajes del usuario
export const getUserCharacters = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Obtener personajes del usuario con información completa
    const characters = await UserCharacter.find({ userId })
      .populate('baseCharacterId', 'name description stats')
      .populate('equipment.weapon', 'name stats')
      .populate('equipment.armor', 'name stats')
      .populate('equipment.accessory', 'name stats')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: characters
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
    const userId = req.user?.id;
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