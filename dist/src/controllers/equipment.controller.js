"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCharacterStats = exports.unequipItem = exports.equipItem = void 0;
const User_1 = require("../models/User");
const Equipment_1 = require("../models/Equipment");
const realtime_service_1 = require("../services/realtime.service");
/**
 * Equipar un item en un personaje
 * POST /api/characters/:characterId/equip
 * Body: { itemId: string }
 */
const equipItem = async (req, res) => {
    const { characterId } = req.params;
    const { itemId } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    if (!itemId) {
        return res.status(400).json({ error: 'Debes proporcionar el ID del item a equipar.' });
    }
    try {
        // Cargar usuario
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        // Verificar que el personaje existe
        const character = user.personajes.find(p => p.personajeId === characterId);
        if (!character) {
            return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
        }
        // Verificar que el item está en el inventario del usuario
        const hasItem = user.inventarioEquipamiento.some((id) => String(id) === String(itemId));
        if (!hasItem) {
            return res.status(404).json({ error: 'El item no se encuentra en tu inventario.' });
        }
        // Verificar que el item existe en la base de datos
        const item = await Equipment_1.Equipment.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: 'El item no existe.' });
        }
        // Verificar que el item no está ya equipado
        const alreadyEquipped = character.equipamiento.some((id) => String(id) === String(itemId));
        if (alreadyEquipped) {
            return res.status(400).json({ error: 'El item ya está equipado en este personaje.' });
        }
        // Equipar el item
        character.equipamiento.push(item._id);
        // ===== RECALCULAR STATS TOTALES =====
        const equippedItemIds = character.equipamiento;
        const equippedItems = await Equipment_1.Equipment.find({ _id: { $in: equippedItemIds } });
        // Calcular bonus de stats por equipamiento
        const equipmentBonus = equippedItems.reduce((acc, equip) => {
            return {
                atk: acc.atk + (equip.stats.atk || 0),
                defensa: acc.defensa + (equip.stats.defensa || 0),
                vida: acc.vida + (equip.stats.vida || 0)
            };
        }, { atk: 0, defensa: 0, vida: 0 });
        // Guardar stats base si no existen (primera vez)
        if (!character.statsBase) {
            character.statsBase = { ...character.stats };
        }
        // Calcular stats totales (base + equipamiento)
        const totalStats = {
            atk: character.statsBase.atk + equipmentBonus.atk,
            defensa: character.statsBase.defensa + equipmentBonus.defensa,
            vida: character.statsBase.vida + equipmentBonus.vida
        };
        // Actualizar stats del personaje
        character.stats = totalStats;
        character.saludMaxima = totalStats.vida;
        // Ajustar salud actual si es necesario (no puede exceder el máximo)
        if (character.saludActual > character.saludMaxima) {
            character.saludActual = character.saludMaxima;
        }
        // Guardar cambios
        await user.save();
        // Emitir evento WebSocket
        try {
            const realtimeService = realtime_service_1.RealtimeService.getInstance();
            realtimeService.notifyCharacterUpdate(userId, characterId, {
                stats: character.stats,
                saludMaxima: character.saludMaxima,
                saludActual: character.saludActual,
                type: 'EQUIP'
            });
        }
        catch (err) {
            if (process.env.NODE_ENV !== 'test') {
                console.warn('[equipItem] RealtimeService no disponible:', err);
            }
        }
        // Respuesta
        res.json({
            message: `${item.nombre} ha sido equipado en ${character.personajeId}.`,
            character: {
                personajeId: character.personajeId,
                stats: character.stats,
                saludMaxima: character.saludMaxima,
                saludActual: character.saludActual,
                equipamiento: character.equipamiento
            },
            equipmentBonus
        });
    }
    catch (error) {
        console.error('Error al equipar el item:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.equipItem = equipItem;
/**
 * Desequipar un item de un personaje
 * POST /api/characters/:characterId/unequip
 * Body: { itemId: string }
 */
const unequipItem = async (req, res) => {
    const { characterId } = req.params;
    const { itemId } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    if (!itemId) {
        return res.status(400).json({ error: 'Debes proporcionar el ID del item a desequipar.' });
    }
    try {
        // Cargar usuario
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        // Verificar que el personaje existe
        const character = user.personajes.find(p => p.personajeId === characterId);
        if (!character) {
            return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
        }
        // Verificar que el item está equipado
        const itemIndex = character.equipamiento.findIndex((id) => String(id) === String(itemId));
        if (itemIndex === -1) {
            return res.status(400).json({ error: 'El item no está equipado en este personaje.' });
        }
        // Obtener info del item antes de desequipar
        const item = await Equipment_1.Equipment.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: 'El item no existe.' });
        }
        // Desequipar el item (remover del array)
        character.equipamiento.splice(itemIndex, 1);
        // ===== RECALCULAR STATS TOTALES =====
        const equippedItemIds = character.equipamiento;
        const equippedItems = await Equipment_1.Equipment.find({ _id: { $in: equippedItemIds } });
        // Calcular bonus de stats por equipamiento restante
        const equipmentBonus = equippedItems.reduce((acc, equip) => {
            return {
                atk: acc.atk + (equip.stats.atk || 0),
                defensa: acc.defensa + (equip.stats.defensa || 0),
                vida: acc.vida + (equip.stats.vida || 0)
            };
        }, { atk: 0, defensa: 0, vida: 0 });
        // Restaurar stats base si existen, o usar los actuales como base
        const statsBase = character.statsBase || character.stats;
        // Calcular stats totales (base + equipamiento restante)
        const totalStats = {
            atk: statsBase.atk + equipmentBonus.atk,
            defensa: statsBase.defensa + equipmentBonus.defensa,
            vida: statsBase.vida + equipmentBonus.vida
        };
        // Actualizar stats del personaje
        character.stats = totalStats;
        character.saludMaxima = totalStats.vida;
        // Ajustar salud actual si excede el nuevo máximo
        if (character.saludActual > character.saludMaxima) {
            character.saludActual = character.saludMaxima;
        }
        // Guardar cambios
        await user.save();
        // Emitir evento WebSocket
        try {
            const realtimeService = realtime_service_1.RealtimeService.getInstance();
            realtimeService.notifyCharacterUpdate(userId, characterId, {
                stats: character.stats,
                saludMaxima: character.saludMaxima,
                saludActual: character.saludActual,
                type: 'UNEQUIP'
            });
        }
        catch (err) {
            if (process.env.NODE_ENV !== 'test') {
                console.warn('[unequipItem] RealtimeService no disponible:', err);
            }
        }
        // Respuesta
        res.json({
            message: `${item.nombre} ha sido desequipado de ${character.personajeId}.`,
            character: {
                personajeId: character.personajeId,
                stats: character.stats,
                saludMaxima: character.saludMaxima,
                saludActual: character.saludActual,
                equipamiento: character.equipamiento
            },
            equipmentBonus
        });
    }
    catch (error) {
        console.error('Error al desequipar el item:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.unequipItem = unequipItem;
/**
 * Obtener stats detallados de un personaje (base + bonos de equipamiento)
 * GET /api/characters/:characterId/stats
 */
const getCharacterStats = async (req, res) => {
    const { characterId } = req.params;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    try {
        // Cargar usuario
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        // Verificar que el personaje existe
        const character = user.personajes.find(p => p.personajeId === characterId);
        if (!character) {
            return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
        }
        // Obtener items equipados
        const equippedItemIds = character.equipamiento;
        const equippedItems = await Equipment_1.Equipment.find({ _id: { $in: equippedItemIds } });
        // Calcular bonus de equipamiento
        const equipmentBonus = equippedItems.reduce((acc, equip) => {
            return {
                atk: acc.atk + (equip.stats.atk || 0),
                defensa: acc.defensa + (equip.stats.defensa || 0),
                vida: acc.vida + (equip.stats.vida || 0)
            };
        }, { atk: 0, defensa: 0, vida: 0 });
        // Stats base (si no existen, usar los actuales como base)
        const statsBase = character.statsBase || character.stats;
        // Respuesta
        res.json({
            personajeId: character.personajeId,
            nivel: character.nivel,
            etapa: character.etapa,
            saludActual: character.saludActual,
            saludMaxima: character.saludMaxima,
            baseStats: statsBase,
            equipmentBonus,
            totalStats: character.stats,
            equippedItems: equippedItems.map(item => ({
                id: item._id,
                nombre: item.nombre,
                rango: item.rango,
                stats: item.stats
            }))
        });
    }
    catch (error) {
        console.error('Error al obtener stats del personaje:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.getCharacterStats = getCharacterStats;
