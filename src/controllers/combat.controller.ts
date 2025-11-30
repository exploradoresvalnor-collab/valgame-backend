import { Request, Response } from 'express';
import { User } from '../models/User';
import Dungeon from '../models/Dungeon';
import { CombatService } from '../services/combat.service';

export const startDungeonCombat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { dungeonId } = req.params;
    const { characterId } = req.body;

    // Validate dungeon exists
    const dungeon = await Dungeon.findById(dungeonId);
    if (!dungeon) {
      res.status(404).json({ error: 'Dungeon not found' });
      return;
    }

    // Validate user and character
    const user = await User.findById(userId);
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
    if (character.nivel < (dungeon as any).nivel) {
      res.status(400).json({ error: 'Character level too low' });
      return;
    }

    if (character.saludActual <= 0) {
      res.status(400).json({ error: 'Character dead' });
      return;
    }

    // Start combat
    const combatService = CombatService.getInstance();
    const combateId = combatService.startCombat([userId]);

    res.status(201).json({
      exito: true,
      combate: {
        id: combateId,
        estado: 'activo',
        turno: 1,
        dungeon: { id: dungeon._id, nombre: dungeon.nombre },
        personaje: { id: character._id, personajeId: character.personajeId },
        enemigo: { tipo: 'default', nivel: (dungeon as any).nivel || 1 }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const performAttack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { combateId, characterId } = req.body;

    // Validate inputs
    if (!combateId || !characterId) {
      res.status(400).json({ error: 'Missing combateId or characterId' });
      return;
    }

    // Get user and character
    const user = await User.findById(userId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const performDefend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { combateId, characterId } = req.body;

    // Get user and character
    const user = await User.findById(userId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const endCombat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { combateId, characterId, resultado } = req.body;

    // Validate inputs
    if (!combateId || !characterId || !resultado) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get user and character
    const user = await User.findById(userId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
