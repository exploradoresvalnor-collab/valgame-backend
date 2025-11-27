"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTeam = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeamById = exports.getUserTeams = void 0;
const Team_1 = require("../../models/teams/Team");
const User_1 = require("../../models/User");
const team_validations_1 = require("../../validations/teams/team.validations");
const mongoose_1 = require("mongoose");
// GET /api/teams - Obtener todos los equipos del usuario
const getUserTeams = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const teams = await Team_1.Team.find({ userId })
            .sort({ updatedAt: -1 })
            .populate('characters', 'personajeId nombre rango nivel etapa')
            .lean();
        return res.json({
            success: true,
            teams,
            total: teams.length
        });
    }
    catch (error) {
        console.error('[GET-USER-TEAMS] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener equipos'
        });
    }
};
exports.getUserTeams = getUserTeams;
// GET /api/teams/:id - Obtener equipo específico
const getTeamById = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        // Validar ID
        const validation = team_validations_1.teamIdParamSchema.safeParse({ id });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.issues[0].message
            });
        }
        const team = await Team_1.Team.findOne({ _id: id, userId })
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
    }
    catch (error) {
        console.error('[GET-TEAM-BY-ID] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener equipo'
        });
    }
};
exports.getTeamById = getTeamById;
// POST /api/teams - Crear nuevo equipo
const createTeam = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        // Validar datos de entrada
        const validation = team_validations_1.createTeamSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.issues[0].message
            });
        }
        const { name, characters } = validation.data;
        // Verificar que el usuario tenga estos personajes
        const user = await User_1.User.findById(userId).select('personajes').lean();
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
        const userTeamsCount = await Team_1.Team.countDocuments({ userId });
        if (userTeamsCount >= 5) {
            return res.status(400).json({
                success: false,
                error: 'Has alcanzado el límite máximo de 5 equipos'
            });
        }
        // Crear el equipo
        const team = await Team_1.Team.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            name,
            characters: characters.map(id => new mongoose_1.Types.ObjectId(id))
        });
        // Si es el primer equipo, marcarlo como activo
        if (userTeamsCount === 0) {
            await Team_1.Team.findByIdAndUpdate(team._id, { isActive: true });
            team.isActive = true;
        }
        const populatedTeam = await Team_1.Team.findById(team._id)
            .populate('characters', 'personajeId nombre rango nivel etapa')
            .lean();
        return res.status(201).json({
            success: true,
            message: 'Equipo creado exitosamente',
            team: populatedTeam
        });
    }
    catch (error) {
        console.error('[CREATE-TEAM] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al crear equipo'
        });
    }
};
exports.createTeam = createTeam;
// PUT /api/teams/:id - Actualizar equipo
const updateTeam = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        // Validar ID y datos
        const idValidation = team_validations_1.teamIdParamSchema.safeParse({ id });
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                error: idValidation.error.issues[0].message
            });
        }
        const dataValidation = team_validations_1.updateTeamSchema.safeParse(req.body);
        if (!dataValidation.success) {
            return res.status(400).json({
                success: false,
                error: dataValidation.error.issues[0].message
            });
        }
        const updateData = dataValidation.data;
        // Verificar que el equipo pertenezca al usuario
        const existingTeam = await Team_1.Team.findOne({ _id: id, userId });
        if (!existingTeam) {
            return res.status(404).json({
                success: false,
                error: 'Equipo no encontrado'
            });
        }
        // Si se están actualizando personajes, verificar que pertenezcan al usuario
        if (updateData.characters) {
            const user = await User_1.User.findById(userId).select('personajes').lean();
            const userCharacterIds = user.personajes.map(p => p._id.toString());
            const invalidCharacters = updateData.characters.filter(charId => !userCharacterIds.includes(charId));
            if (invalidCharacters.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Algunos personajes no pertenecen al usuario'
                });
            }
        }
        // Actualizar equipo
        const updatedTeam = await Team_1.Team.findByIdAndUpdate(id, { ...updateData, characters: updateData.characters?.map(id => new mongoose_1.Types.ObjectId(id)) }, { new: true }).populate('characters', 'personajeId nombre rango nivel etapa');
        return res.json({
            success: true,
            message: 'Equipo actualizado exitosamente',
            team: updatedTeam
        });
    }
    catch (error) {
        console.error('[UPDATE-TEAM] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al actualizar equipo'
        });
    }
};
exports.updateTeam = updateTeam;
// DELETE /api/teams/:id - Eliminar equipo
const deleteTeam = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        // Validar ID
        const validation = team_validations_1.teamIdParamSchema.safeParse({ id });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.issues[0].message
            });
        }
        // Verificar que el equipo pertenezca al usuario y no sea el activo
        const team = await Team_1.Team.findOne({ _id: id, userId });
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
        await Team_1.Team.findByIdAndDelete(id);
        return res.json({
            success: true,
            message: 'Equipo eliminado exitosamente'
        });
    }
    catch (error) {
        console.error('[DELETE-TEAM] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al eliminar equipo'
        });
    }
};
exports.deleteTeam = deleteTeam;
// PUT /api/teams/:id/activate - Activar equipo
const activateTeam = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        // Validar ID
        const validation = team_validations_1.teamIdParamSchema.safeParse({ id });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.issues[0].message
            });
        }
        // Verificar que el equipo pertenezca al usuario
        const team = await Team_1.Team.findOne({ _id: id, userId });
        if (!team) {
            return res.status(404).json({
                success: false,
                error: 'Equipo no encontrado'
            });
        }
        // Desactivar todos los equipos del usuario
        await Team_1.Team.updateMany({ userId }, { isActive: false });
        // Activar el equipo seleccionado
        await Team_1.Team.findByIdAndUpdate(id, { isActive: true });
        return res.json({
            success: true,
            message: 'Equipo activado exitosamente'
        });
    }
    catch (error) {
        console.error('[ACTIVATE-TEAM] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al activar equipo'
        });
    }
};
exports.activateTeam = activateTeam;
