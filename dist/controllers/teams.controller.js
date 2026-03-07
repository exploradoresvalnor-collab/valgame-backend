"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTeam = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeamById = exports.getActiveTeam = exports.getUserTeams = void 0;
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const team_validations_1 = require("../validations/team.validations");
const mongoose_1 = require("mongoose");
// Almacenamiento en memoria para desarrollo (sin base de datos)
const devTeams = [];
const devActiveTeamId = {};
function isDevelopmentMode() {
    return process.env.NODE_ENV !== 'production';
}
function getDevUserData(userId) {
    return {
        _id: userId,
        email: 'dev@example.com',
        username: 'devuser',
        personajes: [
            {
                _id: '507f1f77bcf86cd799439012',
                personajeId: 'dev_char_001',
                nombre: 'Héroe de Desarrollo',
                rango: 'D',
                nivel: 5,
                etapa: 1,
                experiencia: 100,
                stats: { salud: 100, ataque: 20, defensa: 15 },
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
                stats: { salud: 150, ataque: 30, defensa: 25 },
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
                stats: { salud: 120, ataque: 40, defensa: 20 },
                saludActual: 120
            }
        ]
    };
}
// GET /api/teams - Obtener todos los equipos del usuario
const getUserTeams = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        if (isDevelopmentMode()) {
            // Modo desarrollo: devolver equipos en memoria
            const userTeams = devTeams.filter(team => team.userId === userId);
            return res.json({
                success: true,
                teams: userTeams,
                total: userTeams.length
            });
        }
        // Modo producción: usar base de datos
        const teams = await Team_1.Team.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();
        // Obtener personajes del usuario para enriquecer los equipos
        const user = await User_1.User.findById(userId).select('personajes').lean();
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Enriquecer equipos con datos de personajes
        const enrichedTeams = teams.map(team => ({
            ...team,
            characters: team.characters.map((charId) => {
                const personaje = user.personajes.find((p) => p && p._id && p._id.toString() === charId.toString());
                return personaje ? {
                    _id: personaje._id,
                    personajeId: personaje.personajeId,
                    nombre: personaje.nombre,
                    rango: personaje.rango,
                    nivel: personaje.nivel,
                    etapa: personaje.etapa
                } : null;
            }).filter(Boolean) // Filtrar personajes no encontrados
        }));
        return res.json({
            success: true,
            teams: enrichedTeams,
            total: enrichedTeams.length
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
// GET /api/teams/active - Obtener equipo activo del usuario
const getActiveTeam = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        if (isDevelopmentMode()) {
            // Modo desarrollo: obtener equipo activo de memoria
            const activeTeamId = devActiveTeamId[userId];
            if (!activeTeamId) {
                return res.json({
                    success: true,
                    activeTeam: null,
                    message: 'No hay equipo activo'
                });
            }
            const activeTeam = devTeams.find(team => team._id === activeTeamId && team.userId === userId);
            if (!activeTeam) {
                delete devActiveTeamId[userId];
                return res.json({
                    success: true,
                    activeTeam: null,
                    message: 'El equipo activo ya no existe'
                });
            }
            return res.json({
                success: true,
                activeTeam: activeTeam
            });
        }
        // Modo producción: lógica original
        const user = await User_1.User.findById(userId).select('equipoActivoId').lean();
        if (!user || !user.equipoActivoId) {
            return res.json({
                success: true,
                activeTeam: null,
                message: 'No hay equipo activo'
            });
        }
        // Obtener el equipo activo con todos sus datos
        const team = await Team_1.Team.findById(user.equipoActivoId).lean();
        if (!team) {
            // Si el equipo no existe, limpiar la referencia
            await User_1.User.findByIdAndUpdate(userId, { equipoActivoId: null });
            return res.json({
                success: true,
                activeTeam: null,
                message: 'El equipo activo ya no existe'
            });
        }
        // Obtener personajes del usuario para enriquecer el equipo
        const userWithChars = await User_1.User.findById(userId).select('personajes').lean();
        if (!userWithChars) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Enriquecer equipo con datos de personajes
        const enrichedTeam = {
            ...team,
            characters: team.characters.map((charId) => {
                const personaje = userWithChars.personajes.find((p) => p && p._id && p._id.toString() === charId.toString());
                return personaje ? {
                    _id: personaje._id,
                    personajeId: personaje.personajeId,
                    nombre: personaje.nombre,
                    rango: personaje.rango,
                    nivel: personaje.nivel,
                    etapa: personaje.etapa,
                    stats: personaje.stats
                } : null;
            }).filter(Boolean) // Filtrar personajes no encontrados
        };
        return res.json({
            success: true,
            activeTeam: enrichedTeam
        });
    }
    catch (error) {
        console.error('[GET-ACTIVE-TEAM] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener equipo activo'
        });
    }
};
exports.getActiveTeam = getActiveTeam;
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
        const team = await Team_1.Team.findOne({ _id: id, userId }).lean();
        if (!team) {
            return res.status(404).json({
                success: false,
                error: 'Equipo no encontrado'
            });
        }
        // Obtener personajes del usuario para enriquecer el equipo
        const user = await User_1.User.findById(userId).select('personajes').lean();
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Enriquecer equipo con datos de personajes
        const enrichedTeam = {
            ...team,
            characters: team.characters.map((charId) => {
                const personaje = user.personajes.find((p) => p && p._id && p._id.toString() === charId.toString());
                return personaje ? {
                    _id: personaje._id,
                    personajeId: personaje.personajeId,
                    nombre: personaje.nombre,
                    rango: personaje.rango,
                    nivel: personaje.nivel,
                    etapa: personaje.etapa,
                    stats: personaje.stats
                } : null;
            }).filter(Boolean) // Filtrar personajes no encontrados
        };
        return res.json({
            success: true,
            team: enrichedTeam
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
        logToFile('[CREATE-TEAM] Starting team creation');
        const userId = req.userId;
        logToFile(`[CREATE-TEAM] userId: ${userId}`);
        if (!userId) {
            logToFile('[CREATE-TEAM] No userId found');
            return res.status(401).json({ error: 'No autenticado' });
        }
        if (isDevelopmentMode()) {
            // Modo desarrollo: crear equipo en memoria
            const { name, characters } = req.body;
            if (!name || !characters || !Array.isArray(characters) || characters.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre y personajes son requeridos'
                });
            }
            // Verificar que los personajes existen (usando datos de desarrollo)
            const userData = getDevUserData(userId);
            const validCharacterIds = userData.personajes.map((p) => p._id);
            const invalidChars = characters.filter((id) => !validCharacterIds.includes(id));
            if (invalidChars.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Algunos personajes no pertenecen al usuario'
                });
            }
            // Crear equipo
            const newTeam = {
                _id: `dev_team_${Date.now()}`,
                userId,
                name,
                characters: characters.map((charId) => {
                    const personaje = userData.personajes.find((p) => p._id === charId);
                    return {
                        _id: personaje._id,
                        personajeId: personaje.personajeId,
                        nombre: personaje.nombre,
                        rango: personaje.rango,
                        nivel: personaje.nivel,
                        etapa: personaje.etapa,
                        stats: personaje.stats
                    };
                }),
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            devTeams.push(newTeam);
            return res.json({
                success: true,
                team: newTeam
            });
        }
        // Modo producción: lógica original con base de datos
        // ... resto del código original ...
        if (userTeamsCount >= 5) {
            logToFile('[CREATE-TEAM] Team limit reached');
            return res.status(400).json({
                success: false,
                error: 'Has alcanzado el límite máximo de 5 equipos'
            });
        }
        // Verificar si el usuario ya tiene un equipo activo
        const userDoc = await User_1.User.findById(userId).select('equipoActivoId').lean();
        const hasActiveTeam = !!(userDoc && userDoc.equipoActivoId);
        logToFile(`[CREATE-TEAM] User has active team: ${hasActiveTeam}`);
        // Crear el equipo
        logToFile(`[CREATE-TEAM] Creating team with data: ${JSON.stringify({
            userId: new mongoose_1.Types.ObjectId(userId),
            name,
            characters: characters.map(id => new mongoose_1.Types.ObjectId(id))
        })}`);
        const team = await Team_1.Team.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            name,
            characters: characters.map(id => new mongoose_1.Types.ObjectId(id))
        });
        logToFile(`[CREATE-TEAM] Team created successfully: ${team._id}`);
        // Si no hay equipo activo, marcar este como activo
        if (!hasActiveTeam) {
            await Team_1.Team.findByIdAndUpdate(team._id, { isActive: true });
            await User_1.User.findByIdAndUpdate(userId, { equipoActivoId: team._id });
            team.isActive = true;
            logToFile(`[CREATE-TEAM] Team marked as active (first team)`);
        }
        // Enriquecer el equipo con datos de personajes
        const enrichedTeam = {
            ...team.toObject(),
            characters: team.characters.map((charId) => {
                const personaje = user.personajes.find((p) => p && p._id && p._id.toString() === charId.toString());
                return personaje ? {
                    _id: personaje._id,
                    personajeId: personaje.personajeId,
                    nombre: personaje.nombre,
                    rango: personaje.rango,
                    nivel: personaje.nivel,
                    etapa: personaje.etapa
                } : null;
            }).filter(Boolean) // Filtrar personajes no encontrados
        };
        return res.status(201).json({
            success: true,
            message: 'Equipo creado exitosamente',
            team: enrichedTeam
        });
    }
    catch (error) {
        logToFile(`[CREATE-TEAM] Error: ${error.message}`);
        logToFile(`[CREATE-TEAM] Stack: ${error.stack}`);
        console.error('[CREATE-TEAM] Error:', error);
        console.error('[CREATE-TEAM] Stack:', error.stack);
        return res.status(500).json({
            success: false,
            error: 'Error al crear equipo',
            details: error.message
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
        const updatedTeam = await Team_1.Team.findByIdAndUpdate(id, { ...updateData, characters: updateData.characters?.map(id => new mongoose_1.Types.ObjectId(id)) }, { new: true }).lean();
        // Enriquecer el equipo actualizado con datos de personajes
        const user = await User_1.User.findById(userId).select('personajes').lean();
        const enrichedTeam = {
            ...updatedTeam,
            characters: updatedTeam.characters.map((charId) => {
                const personaje = user.personajes.find((p) => p && p._id && p._id.toString() === charId.toString());
                return personaje ? {
                    _id: personaje._id,
                    personajeId: personaje.personajeId,
                    nombre: personaje.nombre,
                    rango: personaje.rango,
                    nivel: personaje.nivel,
                    etapa: personaje.etapa
                } : null;
            }).filter(Boolean) // Filtrar personajes no encontrados
        };
        return res.json({
            success: true,
            message: 'Equipo actualizado exitosamente',
            team: enrichedTeam
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
        if (isDevelopmentMode()) {
            // Modo desarrollo: activar equipo en memoria
            const team = devTeams.find(t => t._id === id && t.userId === userId);
            if (!team) {
                return res.status(404).json({
                    success: false,
                    error: 'Equipo no encontrado'
                });
            }
            // Desactivar todos los equipos del usuario
            devTeams.forEach(t => {
                if (t.userId === userId) {
                    t.isActive = false;
                }
            });
            // Activar el equipo seleccionado
            team.isActive = true;
            devActiveTeamId[userId] = id;
            return res.json({
                success: true,
                message: 'Equipo activado exitosamente'
            });
        }
        // Modo producción: lógica original
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
        // Actualizar el equipo activo en el usuario
        await User_1.User.findByIdAndUpdate(userId, { equipoActivoId: id });
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
