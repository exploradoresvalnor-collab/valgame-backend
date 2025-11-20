"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const characters_controller_1 = require("../controllers/characters.controller");
const equipment_controller_1 = require("../controllers/equipment.controller");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const character_schemas_1 = require("../validations/character.schemas");
const router = (0, express_1.Router)();
// Ruta para usar un item consumible en un personaje específico
// Requiere autenticación y validación
router.post('/:characterId/use-consumable', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), (0, validate_1.validateBody)(character_schemas_1.UseConsumableSchema), characters_controller_1.useConsumable);
// Ruta para revivir a un personaje herido
// Requiere autenticación y validación
router.post('/:characterId/revive', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), characters_controller_1.reviveCharacter);
// Ruta para simular daño (solo para testing)
router.post('/:characterId/damage', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), async (req, res) => {
    try {
        const user = await (await Promise.resolve().then(() => __importStar(require('../models/User')))).User.findById(req.userId);
        const character = user?.personajes.find((p) => p.personajeId === req.params.characterId);
        if (!character)
            return res.status(404).json({ error: 'Personaje no encontrado' });
        const damage = req.body.damage || 10;
        character.saludActual = Math.max(0, character.saludActual - damage);
        await user?.save();
        res.json({
            message: `${character.personajeId} recibió ${damage} de daño`,
            saludActual: character.saludActual,
            saludMaxima: character.saludMaxima
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al aplicar daño' });
    }
});
// Ruta para curar a un personaje que ha perdido salud
// Requiere autenticación y validación
router.post('/:characterId/heal', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), characters_controller_1.healCharacter);
// Ruta para evolucionar un personaje a su siguiente etapa
// Requiere autenticación y validación
router.post('/:characterId/evolve', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), characters_controller_1.evolveCharacter);
// Ruta para añadir experiencia a un personaje
// Requiere autenticación y validación
router.post('/:characterId/add-experience', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), (0, validate_1.validateBody)(character_schemas_1.AddExperienceSchema), characters_controller_1.addExperience);
// Ruta para equipar un item en un personaje
// Requiere autenticación y validación
router.post('/:characterId/equip', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), equipment_controller_1.equipItem);
// Ruta para desequipar un item de un personaje
// Requiere autenticación y validación
router.post('/:characterId/unequip', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), equipment_controller_1.unequipItem);
// Ruta para obtener stats detallados de un personaje
// Requiere autenticación y validación
router.get('/:characterId/stats', auth_1.auth, (0, validate_1.validateParams)(character_schemas_1.CharacterIdParamSchema), equipment_controller_1.getCharacterStats);
exports.default = router;
