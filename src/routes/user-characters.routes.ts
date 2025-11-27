import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  getUserCharacters,
  getUserCharacterById
} from '../controllers/user-characters/userCharacters.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// GET /api/user-characters - Obtener todos los personajes del usuario
router.get('/', getUserCharacters);

// GET /api/user-characters/:id - Obtener personaje específico del usuario
router.get('/:id', getUserCharacterById);

export default router;