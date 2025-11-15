import { Router } from 'express';
import { useConsumable, reviveCharacter, healCharacter, evolveCharacter, addExperience } from '../controllers/characters.controller';
import { equipItem, unequipItem, getCharacterStats } from '../controllers/equipment.controller';
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

// Ruta para simular daño (solo para testing)
router.post(
  '/:characterId/damage',
  auth,
  validateParams(CharacterIdParamSchema),
  async (req: any, res) => {
    try {
      const user = await (await import('../models/User')).User.findById(req.userId);
      const character = user?.personajes.find((p: any) => p.personajeId === req.params.characterId);
      if (!character) return res.status(404).json({ error: 'Personaje no encontrado' });
      
      const damage = req.body.damage || 10;
      character.saludActual = Math.max(0, character.saludActual - damage);
      await user?.save();
      
      res.json({ 
        message: `${character.personajeId} recibió ${damage} de daño`,
        saludActual: character.saludActual,
        saludMaxima: character.saludMaxima
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al aplicar daño' });
    }
  }
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

// Ruta para equipar un item en un personaje
// Requiere autenticación y validación
router.post(
  '/:characterId/equip',
  auth,
  validateParams(CharacterIdParamSchema),
  equipItem
);

// Ruta para desequipar un item de un personaje
// Requiere autenticación y validación
router.post(
  '/:characterId/unequip',
  auth,
  validateParams(CharacterIdParamSchema),
  unequipItem
);

// Ruta para obtener stats detallados de un personaje
// Requiere autenticación y validación
router.get(
  '/:characterId/stats',
  auth,
  validateParams(CharacterIdParamSchema),
  getCharacterStats
);

export default router;
