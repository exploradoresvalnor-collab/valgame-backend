import { Request, Response } from 'express';
import { Team } from '../../models/teams/Team';
import { User } from '../../models/User';
import { createTeamSchema, updateTeamSchema, teamIdParamSchema } from '../../validations/teams/team.validations';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  userId?: string;
}

// GET /api/teams - Obtener todos los equipos del usuario
export const getUserTeams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const teams = await Team.find({ userId })
      .sort({ updatedAt: -1 })
      .populate('characters', 'personajeId nombre rango nivel etapa')
      .lean();

    return res.json({
      success: true,
      teams,
      total: teams.length
    });
  } catch (error: any) {
    console.error('[GET-USER-TEAMS] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener equipos'
    });
  }
};

// GET /api/teams/:id - Obtener equipo específico
export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Validar ID
    const validation = teamIdParamSchema.safeParse({ id });
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error.issues[0].message 
      });
    }

    const team = await Team.findOne({ _id: id, userId })
      .populate('characters', 'personajeId nombre rango nivel etapa stats')
      .lean();

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        error: 'Equipo no encontrado' 
      });
    }

    return res.json({
      success: true,
      team
    });
  } catch (error: any) {
    console.error('[GET-TEAM-BY-ID] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener equipo'
    });
  }
};

// POST /api/teams - Crear nuevo equipo
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Validar datos de entrada
    const validation = createTeamSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error.issues[0].message 
      });
    }

    const { name, characters } = validation.data;

    // Verificar que el usuario tenga estos personajes
    const user = await User.findById(userId).select('personajes').lean();
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que todos los personajes pertenezcan al usuario
    const userCharacterIds = user.personajes.map(p => p._id.toString());
    const invalidCharacters = characters.filter(charId => !userCharacterIds.includes(charId));

    if (invalidCharacters.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Algunos personajes no pertenecen al usuario'
      });
    }

    // Verificar límite de equipos (máximo 5 equipos por usuario)
    const userTeamsCount = await Team.countDocuments({ userId });
    if (userTeamsCount >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Has alcanzado el límite máximo de 5 equipos'
      });
    }

    // Crear el equipo
    const team = await Team.create({
      userId: new Types.ObjectId(userId),
      name,
      characters: characters.map(id => new Types.ObjectId(id))
    });

    // Si es el primer equipo, marcarlo como activo
    if (userTeamsCount === 0) {
      await Team.findByIdAndUpdate(team._id, { isActive: true });
      team.isActive = true;
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('characters', 'personajeId nombre rango nivel etapa')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Equipo creado exitosamente',
      team: populatedTeam
    });
  } catch (error: any) {
    console.error('[CREATE-TEAM] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al crear equipo'
    });
  }
};

// PUT /api/teams/:id - Actualizar equipo
export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Validar ID y datos
    const idValidation = teamIdParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return res.status(400).json({ 
        success: false, 
        error: idValidation.error.issues[0].message 
      });
    }

    const dataValidation = updateTeamSchema.safeParse(req.body);
    if (!dataValidation.success) {
      return res.status(400).json({ 
        success: false, 
        error: dataValidation.error.issues[0].message 
      });
    }

    const updateData = dataValidation.data;

    // Verificar que el equipo pertenezca al usuario
    const existingTeam = await Team.findOne({ _id: id, userId });
    if (!existingTeam) {
      return res.status(404).json({ 
        success: false, 
        error: 'Equipo no encontrado' 
      });
    }

    // Si se están actualizando personajes, verificar que pertenezcan al usuario
    if (updateData.characters) {
      const user = await User.findById(userId).select('personajes').lean();
      const userCharacterIds = user!.personajes.map(p => p._id.toString());
      const invalidCharacters = updateData.characters.filter(charId => !userCharacterIds.includes(charId));

      if (invalidCharacters.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Algunos personajes no pertenecen al usuario'
        });
      }
    }

    // Actualizar equipo
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { ...updateData, characters: updateData.characters?.map(id => new Types.ObjectId(id)) },
      { new: true }
    ).populate('characters', 'personajeId nombre rango nivel etapa');

    return res.json({
      success: true,
      message: 'Equipo actualizado exitosamente',
      team: updatedTeam
    });
  } catch (error: any) {
    console.error('[UPDATE-TEAM] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar equipo'
    });
  }
};

// DELETE /api/teams/:id - Eliminar equipo
export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Validar ID
    const validation = teamIdParamSchema.safeParse({ id });
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error.issues[0].message 
      });
    }

    // Verificar que el equipo pertenezca al usuario y no sea el activo
    const team = await Team.findOne({ _id: id, userId });
    if (!team) {
      return res.status(404).json({ 
        success: false, 
        error: 'Equipo no encontrado' 
      });
    }

    if (team.isActive) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar el equipo activo'
      });
    }

    await Team.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Equipo eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('[DELETE-TEAM] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al eliminar equipo'
    });
  }
};

// PUT /api/teams/:id/activate - Activar equipo
export const activateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Validar ID
    const validation = teamIdParamSchema.safeParse({ id });
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error.issues[0].message 
      });
    }

    // Verificar que el equipo pertenezca al usuario
    const team = await Team.findOne({ _id: id, userId });
    if (!team) {
      return res.status(404).json({ 
        success: false, 
        error: 'Equipo no encontrado' 
      });
    }

    // Desactivar todos los equipos del usuario
    await Team.updateMany({ userId }, { isActive: false });

    // Activar el equipo seleccionado
    await Team.findByIdAndUpdate(id, { isActive: true });

    return res.json({
      success: true,
      message: 'Equipo activado exitosamente'
    });
  } catch (error: any) {
    console.error('[ACTIVATE-TEAM] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al activar equipo'
    });
  }
};
