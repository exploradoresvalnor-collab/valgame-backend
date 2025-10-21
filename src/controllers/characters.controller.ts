import { Request, Response } from 'express';
import { User } from '../models/User';
import GameSettings from '../models/GameSetting';
import { IConsumable } from '../models/Consumable';
import { Types } from 'mongoose';
import BaseCharacter from '../models/BaseCharacter';
import { RealtimeService } from '../services/realtime.service';

// Interfaz para extender Request y que incluya el userId del middleware de auth
interface AuthRequest extends Request {
  userId?: string;
}

export const reviveCharacter = async (req: AuthRequest, res: Response) => {
  const { characterId } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  try {
    // Cargar usuario y configuración del juego
    const [user, gameSettings] = await Promise.all([
      User.findById(userId),
      GameSettings.findOne()
    ]);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (!gameSettings) return res.status(500).json({ error: 'Configuración del juego no encontrada.' });

    // Encontrar el personaje específico dentro del array del usuario
    const character = user.personajes.find(p => p.personajeId === characterId);

    if (!character) {
      return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
    }

    // Validar que el personaje está herido
    if (character.estado !== 'herido') {
      return res.status(400).json({ error: `El personaje ${character.personajeId} no está herido.` });
    }

    // Validar y cobrar el costo de resurrección
    const cost = gameSettings.costo_revivir_personaje;
    if (user.val < cost) {
      return res.status(400).json({ error: `No tienes suficiente VAL para revivir al personaje. Costo: ${cost} VAL.` });
    }

    // Realizar el cobro
    user.val -= cost;

    // Revivir al personaje
    character.estado = 'saludable';
    character.saludActual = character.saludMaxima;
    character.fechaHerido = null;

    // Guardar los cambios en la base de datos
    await user.save();

    // Notificar en tiempo real (solo si está inicializado)
    try {
      const realtimeService = RealtimeService.getInstance();
      realtimeService.notifyCharacterUpdate(userId, characterId, {
        estado: character.estado,
        saludActual: character.saludActual,
        type: 'REVIVE'
      });
    } catch (err) {
      // En testing, el servicio de realtime puede no estar inicializado
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[reviveCharacter] RealtimeService no disponible:', err);
      }
    }

    // Enviar respuesta
    res.json({
      message: `¡El personaje ${character.personajeId} ha sido revivido!`,
      valRestante: user.val,
      characterState: {
        personajeId: character.personajeId,
        estado: character.estado,
        saludActual: character.saludActual
      }
    });

  } catch (error) {
    console.error('Error al revivir el personaje:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// --- FUNCIÓN CORREGIDA PARA USAR CONSUMIBLES ---
export const useConsumable = async (req: AuthRequest, res: Response) => {
  const { characterId } = req.params;
  const { itemId } = req.body; // ID del item consumible
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }
  if (!itemId) {
    return res.status(400).json({ error: 'Debes proporcionar el ID del consumible a usar.' });
  }

  try {
    // RUTA DE POPULATE CORREGIDA
    const user = await User.findById(userId).populate('inventarioConsumibles.consumableId');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // RUTA DE ACCESO CORREGIDA
    const inventoryItem = user.inventarioConsumibles.find((i: any) => i.consumableId._id.toString() === itemId);

    if (!inventoryItem) {
      return res.status(404).json({ error: 'El item no se encuentra en tu inventario.' });
    }

    const consumable = inventoryItem.consumableId as unknown as IConsumable;

    const character = user.personajes.find(p => p.personajeId === characterId);
    if (!character) {
      return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
    }

    // Lógica para aplicar efectos del consumible (ejemplo)
    character.saludActual = Math.min(character.saludMaxima, character.saludActual + (consumable.efectos.mejora_vida || 0));

    // Reducir usos o eliminar
    inventoryItem.usos_restantes -= 1;
    if (inventoryItem.usos_restantes <= 0) {
  // Intentar eliminar el subdocumento de forma segura
  const docArrayAny: any = user.inventarioConsumibles as any;
      // Determinar un id objetivo para eliminar: preferir _id del subdocumento, si existe
      const targetId = (inventoryItem as any)._id ? (inventoryItem as any)._id : ((inventoryItem as any).consumableId && ((inventoryItem as any).consumableId._id || (inventoryItem as any).consumableId));

      try {
        const tid = String(targetId);
        // Filtrar por coincidencia con el _id del subdocumento o con el _id del consumable
        user.inventarioConsumibles = user.inventarioConsumibles.filter((c: any) => {
          const subId = c && c._id ? String(c._id) : null;
          const cid = c && c.consumableId ? (c.consumableId._id ? String(c.consumableId._id) : String(c.consumableId)) : null;
          // Mantener el elemento si ninguno coincide con tid
          return subId !== tid && cid !== tid;
        }) as any;
      } catch (err) {
        // último recurso: filtrar por igualdad profunda
        user.inventarioConsumibles = user.inventarioConsumibles.filter((c: any) => JSON.stringify(c) !== JSON.stringify(inventoryItem)) as any;
      }
    }

    // Asegurarse de marcar el array como modificado para que mongoose persista los cambios
    if (typeof (user as any).markModified === 'function') {
      (user as any).markModified('inventarioConsumibles');
    }

    await user.save();

    res.json({
      message: `Has usado ${consumable.nombre} en ${character.personajeId}.`,
      saludActual: character.saludActual
    });

  } catch (error) {
    console.error('Error al usar el consumible:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const healCharacter = async (req: AuthRequest, res: Response) => {
  const { characterId } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const character = user.personajes.find(p => p.personajeId === characterId);
    if (!character) {
      return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
    }

    // 1. Validar el estado del personaje
    if (character.estado === 'herido') {
      return res.status(400).json({ error: `El personaje está herido y debe ser revivido, no curado.` });
    }
    if (character.saludActual >= character.saludMaxima) {
      return res.status(400).json({ error: `El personaje ${character.personajeId} ya tiene la salud al máximo.` });
    }

    // 2. Calcular el costo (1 VAL por 10 HP curados, redondeado hacia arriba)
    const healthToHeal = character.saludMaxima - character.saludActual;
    const cost = Math.ceil(healthToHeal / 10);

    if (user.val < cost) {
      return res.status(400).json({ error: `No tienes suficiente VAL para curar al personaje. Costo: ${cost} VAL.` });
    }

    // 3. Realizar la transacción
    user.val -= cost;
    character.saludActual = character.saludMaxima;

    await user.save();

    // Notificar en tiempo real (solo si está inicializado)
    try {
      const realtimeService = RealtimeService.getInstance();
      realtimeService.notifyCharacterUpdate(userId, characterId, {
        saludActual: character.saludActual,
        type: 'HEAL'
      });
    } catch (err) {
      // En testing, el servicio de realtime puede no estar inicializado
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[healCharacter] RealtimeService no disponible:', err);
      }
    }

    // 4. Enviar respuesta
    res.json({
      message: `¡El personaje ${character.personajeId} ha sido curado por completo!`,
      valRestante: user.val,
      costo: cost,
      characterState: {
        personajeId: character.personajeId,
        saludActual: character.saludActual
      }
    });

  } catch (error) {
    console.error('Error al curar el personaje:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

import { LevelHistory } from '../models/LevelHistory';
import LevelRequirement from '../models/LevelRequirement';

export const addExperience = async (req: AuthRequest, res: Response) => {
  const { characterId } = req.params;
  const { amount } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'La cantidad de experiencia debe ser mayor a 0.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const character = user.personajes.find(p => p.personajeId === characterId);
    if (!character) {
      return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
    }

    // Obtener el nivel actual y la experiencia necesaria para el siguiente nivel
    const levelBefore = character.nivel;
    character.experiencia = (character.experiencia || 0) + amount;

    // Verificar si subió de nivel
    let leveledUp = false;
    while (true) {
      const nextLevelReq = await LevelRequirement.findOne({ nivel: character.nivel + 1 });

      if (!nextLevelReq || character.experiencia < nextLevelReq.experiencia_requerida) {
        break;
      }

      // Subir de nivel
      character.nivel += 1;
      leveledUp = true;

      // Guardar stats anteriores antes de actualizarlos
      const statsAnteriores = { ...character.stats };
      const experienciaAnterior = character.experiencia - amount;

      // Actualizar stats según el nuevo nivel
      const baseChar = await BaseCharacter.findOne({ id: character.personajeId });
      if (baseChar) {
        character.stats = {
          atk: baseChar.stats.atk + (character.nivel - 1) * 2,
          defensa: baseChar.stats.defensa + (character.nivel - 1) * 2,
          vida: baseChar.stats.vida + (character.nivel - 1) * 10
        };
        character.saludMaxima = character.stats.vida;
        character.saludActual = character.stats.vida;
      }

      // Si subió de nivel, registrar en el historial con la información detallada
      const levelHistory = new LevelHistory({
        userId: user._id,
        personajeId: characterId,
        nivel: character.nivel,
        experienciaTotal: character.experiencia,
        experienciaAnterior: experienciaAnterior,
        experienciaNueva: character.experiencia,
        statsAnteriores: statsAnteriores,
        statsNuevos: character.stats,
        fecha: new Date()
      });
      await levelHistory.save();
    }

    await user.save();

    // Notificar en tiempo real (solo si está inicializado)
    try {
      const realtimeService = RealtimeService.getInstance();
      realtimeService.notifyCharacterUpdate(userId, characterId, {
        nivel: character.nivel,
        experiencia: character.experiencia,
        stats: character.stats,
        type: leveledUp ? 'LEVEL_UP' : 'EXP_GAIN'
      });
    } catch (err) {
      // En testing, el servicio de realtime puede no estar inicializado
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[addExperience] RealtimeService no disponible:', err);
      }
    }

    res.json({
      message: leveledUp 
        ? `¡${character.personajeId} ha subido al nivel ${character.nivel}!` 
        : `${character.personajeId} ha ganado ${amount} de experiencia`,
      characterState: {
        personajeId: character.personajeId,
        nivel: character.nivel,
        experiencia: character.experiencia,
        stats: character.stats,
        leveledUp
      }
    });

  } catch (error) {
    console.error('Error al añadir experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const evolveCharacter = async (req: AuthRequest, res: Response) => {
  const { characterId } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const characterToEvolve = user.personajes.find(p => p.personajeId === characterId);
    if (!characterToEvolve) {
      return res.status(404).json({ error: `Personaje con ID ${characterId} no encontrado.` });
    }

    const baseChar = await BaseCharacter.findOne({ id: characterToEvolve.personajeId });
    if (!baseChar || !baseChar.evoluciones) {
      return res.status(404).json({ error: 'No se encontró la información de evolución para este personaje.' });
    }

    const nextEvolution = baseChar.evoluciones.find(evo => evo.etapa === characterToEvolve.etapa + 1);
    if (!nextEvolution) {
      return res.status(400).json({ error: 'Este personaje ya ha alcanzado su máxima evolución.' });
    }

    // --- Verificación de Requisitos ---
  const { nivel, val, evo } = nextEvolution.requisitos;
  // val puede venir como string o number, manejamos ambos
  const valCost = typeof val === 'number' ? val : parseInt(String(val || '0'), 10);

    if (characterToEvolve.nivel < nivel) {
      return res.status(400).json({ error: `Se requiere nivel ${nivel} para evolucionar. Nivel actual: ${characterToEvolve.nivel}.` });
    }
    if (user.val < valCost) {
      return res.status(400).json({ error: `No tienes suficiente VAL para evolucionar. Requerido: ${valCost} VAL.` });
    }
    if (user.evo < evo) {
      return res.status(400).json({ error: `No tienes suficientes Cristales de Evolución. Requerido: ${evo} EVO.` });
    }

    // --- Cobro de Recursos ---
    user.val -= valCost;
    user.evo -= evo;

    // --- Actualización del Personaje ---
  // nextEvolution.etapa puede ser number; casteamos para satisfacer el tipo esperado en el subdocumento
  characterToEvolve.etapa = nextEvolution.etapa as any;
    characterToEvolve.stats = nextEvolution.stats; // Asignar las nuevas estadísticas base
    characterToEvolve.saludMaxima = nextEvolution.stats.vida; // Actualizar salud máxima
    characterToEvolve.saludActual = nextEvolution.stats.vida; // Curar completamente

    await user.save();

    res.json({
      message: `¡Felicidades! ${baseChar.nombre} ha evolucionado a ${nextEvolution.nombre}! `,
      character: {
        personajeId: characterToEvolve.personajeId,
        etapa: characterToEvolve.etapa,
        stats: characterToEvolve.stats
      }
    });

  } catch (error) {
    console.error('Error al evolucionar el personaje:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};