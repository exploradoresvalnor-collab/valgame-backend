"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endCombat = exports.performDefend = exports.performAttack = exports.startDungeonCombat = void 0;
const User_1 = require("../models/User");
const Dungeon_1 = __importDefault(require("../models/Dungeon"));
const combat_service_1 = require("../services/combat.service");
const startDungeonCombat = async (req, res) => {
    try {
        const { userId } = req.user;
        const { dungeonId } = req.params;
        const { characterId } = req.body;
        // Validate dungeon exists
        const dungeon = await Dungeon_1.default.findById(dungeonId);
        if (!dungeon) {
            res.status(404).json({ error: 'Dungeon not found' });
            return;
        }
        // Validate user and character
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const character = user.personajes.id(characterId);
        if (!character) {
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        // Validate prerequisites
        if (character.nivel < dungeon.nivel) {
            res.status(400).json({ error: 'Character level too low' });
            return;
        }
        if (character.saludActual <= 0) {
            res.status(400).json({ error: 'Character dead' });
            return;
        }
        // Start combat
        const combatService = combat_service_1.CombatService.getInstance();
        const combateId = combatService.startCombat([userId]);
        res.status(201).json({
            exito: true,
            combate: {
                id: combateId,
                estado: 'activo',
                turno: 1,
                dungeon: { id: dungeon._id, nombre: dungeon.nombre },
                personaje: { id: character._id, personajeId: character.personajeId },
                enemigo: { tipo: 'default', nivel: dungeon.nivel || 1 }
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.startDungeonCombat = startDungeonCombat;
const performAttack = async (req, res) => {
    try {
        const { userId } = req.user;
        const { combateId, characterId } = req.body;
        // Validate inputs
        if (!combateId || !characterId) {
            res.status(400).json({ error: 'Missing combateId or characterId' });
            return;
        }
        // Get user and character
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const character = user.personajes.id(characterId);
        if (!character) {
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        // Calculate damage: base ATK + 25% crit chance
        const dano = character.stats?.atk || 0;
        const critico = Math.random() < 0.25;
        const danofinal = critico ? dano * 1.5 : dano;
        res.status(200).json({
            exito: true,
            ataque: {
                personaje: character.personajeId,
                dano: danofinal,
                critico,
                tipo: 'fisico',
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.performAttack = performAttack;
const performDefend = async (req, res) => {
    try {
        const { userId } = req.user;
        const { combateId, characterId } = req.body;
        // Get user and character
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const character = user.personajes.id(characterId);
        if (!character) {
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        // Calculate defense bonus
        const reduccionDano = (character.stats?.defensa || 0) * 0.5;
        res.status(200).json({
            exito: true,
            defensa: {
                personaje: character.personajeId,
                reduccionDano,
                estado: 'escudo_activo',
                duracionTurnos: 1
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.performDefend = performDefend;
const endCombat = async (req, res) => {
    try {
        const { userId } = req.user;
        const { combateId, characterId, resultado } = req.body;
        // Validate inputs
        if (!combateId || !characterId || !resultado) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Get user and character
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const character = user.personajes.id(characterId);
        if (!character) {
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        // Calculate rewards
        const experienciaCombate = resultado === 'victoria' ? 100 : 25;
        const valGanado = resultado === 'victoria' ? 50 : 10;
        // Update character
        character.experiencia = (character.experiencia || 0) + experienciaCombate;
        user.val = (user.val || 0) + valGanado;
        await user.save();
        res.status(200).json({
            exito: true,
            combate: {
                id: combateId,
                resultado,
                duracionTurnos: 5
            },
            recompensas: {
                experiencia: experienciaCombate,
                val: valGanado
            },
            estadisticas: {
                experienciaTotal: character.experiencia,
                valTotal: user.val
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.endCombat = endCombat;
