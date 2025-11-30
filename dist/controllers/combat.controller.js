"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endCombat = exports.performDefend = exports.performAttack = exports.startDungeonCombat = void 0;
const combat_service_1 = require("../services/combat.service");
const User_1 = require("../models/User");
const Dungeon_1 = __importDefault(require("../models/Dungeon"));
const combatService = combat_service_1.CombatService.getInstance();
const startDungeonCombat = async (req, res) => {
    try {
        const { dungeonId } = req.params;
        const userId = req.userId;
        const { characterId } = req.body;
        const dungeon = await Dungeon_1.default.findById(dungeonId);
        if (!dungeon) {
            return res.status(404).json({ error: 'Dungeon no encontrado' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const character = user.personajes.find((p) => p._id?.toString() === characterId);
        if (!character) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }
        if (character.nivel < dungeon.nivel_requerido_minimo) {
            return res.status(400).json({ error: `Nivel insuficiente. Se requiere nivel ${dungeon.nivel_requerido_minimo}` });
        }
        if (character.saludActual <= 0) {
            return res.status(400).json({ error: 'El personaje está muerto' });
        }
        const combatState = await combatService.startCombat([userId]);
        res.status(201).json({
            exito: true,
            combate: {
                id: combatState.id,
                estado: combatState.status,
                turno: combatState.currentTurn
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error al iniciar combate' });
    }
};
exports.startDungeonCombat = startDungeonCombat;
const performAttack = async (req, res) => {
    try {
        const userId = req.userId;
        const { combateId, characterId, target } = req.body;
        if (!combateId || !characterId) {
            return res.status(400).json({ error: 'combateId y characterId son requeridos' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const character = user.personajes.find((p) => p._id?.toString() === characterId);
        if (!character) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }
        const ataque = character.stats?.atk || 10;
        const critico = Math.random() < 0.25;
        const dano = critico ? Math.floor(ataque * 1.5) : ataque;
        res.json({
            exito: true,
            ataque: {
                personaje: character.personajeId,
                dano,
                critico,
                tipo: critico ? 'crítico' : 'normal'
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error al realizar ataque' });
    }
};
exports.performAttack = performAttack;
const performDefend = async (req, res) => {
    try {
        const userId = req.userId;
        const { combateId, characterId } = req.body;
        if (!combateId || !characterId) {
            return res.status(400).json({ error: 'combateId y characterId son requeridos' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const character = user.personajes.find((p) => p._id?.toString() === characterId);
        if (!character) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }
        const defensaBoost = Math.floor((character.stats?.defensa || 5) * 0.5);
        res.json({
            exito: true,
            defensa: {
                personaje: character.personajeId,
                reduccionDano: defensaBoost,
                estado: 'en_defensa'
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error al defender' });
    }
};
exports.performDefend = performDefend;
const endCombat = async (req, res) => {
    try {
        const userId = req.userId;
        const { combateId, characterId, resultado } = req.body;
        if (!combateId || !characterId) {
            return res.status(400).json({ error: 'combateId y characterId son requeridos' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const character = user.personajes.find((p) => p._id?.toString() === characterId);
        if (!character) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }
        const expGanada = resultado === 'victoria' ? 100 : 25;
        const valGanado = resultado === 'victoria' ? 50 : 10;
        character.experiencia = (character.experiencia || 0) + expGanada;
        user.val = (user.val || 0) + valGanado;
        await user.save();
        res.json({
            exito: true,
            combate: {
                id: combateId,
                resultado,
                personaje: character.personajeId
            },
            recompensas: {
                experiencia: expGanada,
                val: valGanado
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error al finalizar combate' });
    }
};
exports.endCombat = endCombat;
