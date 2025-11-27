import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import {
  getUserTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  activateTeam
} from '../../controllers/teams/teams.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// GET /api/teams - Obtener todos los equipos del usuario
router.get('/', getUserTeams);

// GET /api/teams/:id - Obtener equipo específico
router.get('/:id', getTeamById);

// POST /api/teams - Crear nuevo equipo
router.post('/', createTeam);

// PUT /api/teams/:id - Actualizar equipo
router.put('/:id', updateTeam);

// DELETE /api/teams/:id - Eliminar equipo
router.delete('/:id', deleteTeam);

// PUT /api/teams/:id/activate - Activar equipo
router.put('/:id/activate', activateTeam);

export default router;