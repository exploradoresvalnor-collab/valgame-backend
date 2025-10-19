import { Router } from 'express';
import { useConsumable, reviveCharacter, healCharacter, evolveCharacter, addExperience } from '../controllers/characters.controller';
import { auth } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';
import { 
  AddExperienceSchema, 
  UseConsumableSchema, 
  CharacterIdParamSchema 
} from '../validations/character.schemas';

const router = Router();

// Ruta para usar un item consumible en un personaje específico
// Requiere autenticación y validación
router.post(
  '/:characterId/use-consumable', 
  auth, 
  validateParams(CharacterIdParamSchema),
  validateBody(UseConsumableSchema),
  useConsumable
);

// Ruta para revivir a un personaje herido
// Requiere autenticación y validación
router.post(
  '/:characterId/revive', 
  auth, 
  validateParams(CharacterIdParamSchema),
  reviveCharacter
);

// Ruta para curar a un personaje que ha perdido salud
// Requiere autenticación y validación
router.post(
  '/:characterId/heal', 
  auth, 
  validateParams(CharacterIdParamSchema),
  healCharacter
);

// Ruta para evolucionar un personaje a su siguiente etapa
// Requiere autenticación y validación
router.post(
  '/:characterId/evolve', 
  auth, 
  validateParams(CharacterIdParamSchema),
  evolveCharacter
);

// Ruta para añadir experiencia a un personaje
// Requiere autenticación y validación
router.post(
  '/:characterId/add-experience', 
  auth, 
  validateParams(CharacterIdParamSchema),
  validateBody(AddExperienceSchema),
  addExperience
);

export default router;
