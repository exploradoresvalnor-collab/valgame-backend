import { Request, Response } from 'express';
import { CombatService } from '../services/combat.service';
import { User } from '../models/User';
import Dungeon from '../models/Dungeon';

const combatService = CombatService.getInstance();

export const startDungeonCombat = async (req: Request, res: Response) => {
  try {
    const { dungeonId } = req.params;
    const userId = (req as any).userId;
    const { characterId } = req.body;

    const dungeon = await Dungeon.findById(dungeonId);
    if (!dungeon) {
      return res.status(404).json({ error: 'Dungeon no encontrado' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const character = user.personajes.find((p: any) => p._id?.toString() === characterId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al iniciar combate' });
  }
};

export const performAttack = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { combateId, characterId, target } = req.body;

    if (!combateId || !characterId) {
      return res.status(400).json({ error: 'combateId y characterId son requeridos' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const character = user.personajes.find((p: any) => p._id?.toString() === characterId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al realizar ataque' });
  }
};

export const performDefend = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { combateId, characterId } = req.body;

    if (!combateId || !characterId) {
      return res.status(400).json({ error: 'combateId y characterId son requeridos' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const character = user.personajes.find((p: any) => p._id?.toString() === characterId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al defender' });
  }
};

export const endCombat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { combateId, characterId, resultado } = req.body;

    if (!combateId || !characterId) {
      return res.status(400).json({ error: 'combateId y characterId son requeridos' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const character = user.personajes.find((p: any) => p._id?.toString() === characterId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al finalizar combate' });
  }
};
