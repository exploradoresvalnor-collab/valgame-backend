"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCharacterById = exports.getUserCharacters = void 0;
const userCharacter_1 = __importDefault(require("../../models/userCharacter"));
// GET /api/user-characters - Obtener todos los personajes del usuario
const getUserCharacters = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Obtener personajes del usuario con información completa
        const characters = await userCharacter_1.default.find({ userId })
            .populate('baseCharacterId', 'name description stats')
            .populate('equipment.weapon', 'name stats')
            .populate('equipment.armor', 'name stats')
            .populate('equipment.accessory', 'name stats')
            .sort({ createdAt: -1 });
        return res.json({
            success: true,
            data: characters
        });
    }
    catch (error) {
        console.error('[GET-USER-CHARACTERS] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener personajes del usuario'
        });
    }
};
exports.getUserCharacters = getUserCharacters;
// GET /api/user-characters/:id - Obtener personaje específico del usuario
const getUserCharacterById = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        const character = await userCharacter_1.default.findOne({ _id: id, userId })
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
    }
    catch (error) {
        console.error('[GET-USER-CHARACTER-BY-ID] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener personaje'
        });
    }
};
exports.getUserCharacterById = getUserCharacterById;
