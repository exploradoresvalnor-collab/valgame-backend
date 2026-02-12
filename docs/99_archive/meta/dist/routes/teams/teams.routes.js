"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const teams_controller_1 = require("../../controllers/teams/teams.controller");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.auth);
// GET /api/teams - Obtener todos los equipos del usuario
router.get('/', teams_controller_1.getUserTeams);
// GET /api/teams/:id - Obtener equipo específico
router.get('/:id', teams_controller_1.getTeamById);
// POST /api/teams - Crear nuevo equipo
router.post('/', teams_controller_1.createTeam);
// PUT /api/teams/:id - Actualizar equipo
router.put('/:id', teams_controller_1.updateTeam);
// DELETE /api/teams/:id - Eliminar equipo
router.delete('/:id', teams_controller_1.deleteTeam);
// PUT /api/teams/:id/activate - Activar equipo
router.put('/:id/activate', teams_controller_1.activateTeam);
exports.default = router;
