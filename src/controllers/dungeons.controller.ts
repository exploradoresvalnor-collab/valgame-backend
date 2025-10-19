import { Request, Response } from 'express';
import { User, IPersonajeSubdocument } from '../models/User';
import Dungeon from '../models/Dungeon';
import GameSettings from '../models/GameSetting';
import PlayerStat from '../models/PlayerStat'; // Importa el modelo PlayerStat
import LevelRequirement from '../models/LevelRequirement'; // Importar requisitos de nivel
import { handleLevelUp } from '../services/character.service'; // Importar el nuevo servicio
import { IEquipment } from '../models/Equipment';
import { Item } from '../models/Item';
import { IConsumable } from '../models/Consumable';

// Interfaz para extender Request y que incluya el userId del middleware de auth
interface AuthRequest extends Request {
  userId?: string;
}

// La función principal que manejará el combate
export const startDungeon = async (req: AuthRequest, res: Response) => {
  const { dungeonId } = req.params;
  const { team } = req.body; // Se espera un array de IDs de personajes del usuario
  const userId = req.userId;

  // --- 1. Validaciones Iniciales ---
  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }
  if (!Array.isArray(team) || team.length === 0) {
    return res.status(400).json({ error: 'Debes seleccionar un equipo de personajes.' });
  }

  try {
    // --- 2. Cargar Todos los Datos Necesarios ---
    const [user, dungeon, gameSettings, levelRequirements] = await Promise.all([
      User.findById(userId).populate({ path: 'personajes.equipamiento', model: 'Item' }),
      Dungeon.findById(dungeonId),
      GameSettings.findOne(),
      LevelRequirement.find() // Cargar todos los requisitos de nivel
    ]);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (!dungeon) return res.status(404).json({ error: 'Mazmorra no encontrada.' });
    if (!gameSettings) return res.status(500).json({ error: 'Configuración del juego no encontrada.' });
    if (!levelRequirements || levelRequirements.length === 0) return res.status(500).json({ error: 'Requisitos de nivel no encontrados.' });
    if (team.length > gameSettings.MAX_PERSONAJES_POR_EQUIPO) {
        return res.status(400).json({ error: `El equipo no puede tener más de ${gameSettings.MAX_PERSONAJES_POR_EQUIPO} personajes.` });
    }

    // --- 3. Preparación del Equipo y Validación ---
    const combatTeam: IPersonajeSubdocument[] = [];
    let teamATK = 0;
    let teamDEF = 0;

    for (const charId of team) {
      const character = user.personajes.find(p => p.personajeId === charId);
      if (!character) {
        return res.status(404).json({ error: `Personaje con ID ${charId} no encontrado en tu equipo.` });
      }
      if (character.estado === 'herido') {
        return res.status(400).json({ error: `El personaje ${character.personajeId} está herido y no puede combatir.` });
      }

      // Sumar stats base
      let finalCharATK = character.stats.atk;
      let finalCharDEF = character.stats.defensa;

      // Sumar stats del equipamiento (ya populado)
      if (character.equipamiento) {
        for (const item of character.equipamiento) {
          // 1. Casteamos el item a 'any' para poder acceder a la clave discriminadora 'tipoItem',
          //    que existe en los datos de Mongoose pero no está declarada en la interfaz IItem.
          const genericItem = item as any;

          // 2. Comprobamos si el item es del tipo 'Equipment' usando la clave discriminadora.
          if (genericItem.tipoItem === 'Equipment') {
            // 3. Ahora que sabemos que es equipamiento, lo tratamos como IEquipment para acceder a sus stats.
            //    Usamos 'unknown' como paso intermedio porque los tipos ObjectId y IEquipment no se solapan.
            const equipment = item as unknown as IEquipment;
            if (equipment.stats) {
              finalCharATK += equipment.stats.atk || 0;
              finalCharDEF += equipment.stats.defensa || 0;
            }
          }
        }
      }

      // --- NUEVO: Sumar stats de buffs activos ---
      const now = new Date();
      const activeBuffs = [];
      for (const buff of character.activeBuffs) {
          if (buff.expiresAt > now) {
              activeBuffs.push(buff);
              // Aplicar efectos del buff
              if (buff.effects.mejora_atk) {
                  finalCharATK += buff.effects.mejora_atk;
              }
              if (buff.effects.mejora_defensa) {
                  finalCharDEF += buff.effects.mejora_defensa;
              }
          } 
      }
      // Limpiar buffs expirados del personaje
      character.activeBuffs = activeBuffs;
      
      // Añadir a los totales del equipo
      teamATK += finalCharATK;
      teamDEF += finalCharDEF;

      combatTeam.push(character);
    }
    let dungeonCurrentHP = dungeon.stats.vida;
    const combatLog: string[] = [];
    let playerTurn = true;
    let battleResult: 'victoria' | 'derrota' | 'en_curso' = 'en_curso';

    // --- 4. El Bucle de Combate ---
    while (battleResult === 'en_curso') {
      if (playerTurn) {
        combatLog.push('--- Turno del Equipo ---');
        const missed = Math.random() < dungeon.probabilidades.fallo_ataque_jugador;
        if (missed) {
          combatLog.push('¡El equipo ha fallado su ataque!');
        } else {
          const damage = Math.max(1, teamATK - dungeon.stats.defensa);
          dungeonCurrentHP -= damage;
          combatLog.push(`El equipo ataca y causa ${damage} de daño. Vida de la mazmorra: ${Math.max(0, dungeonCurrentHP)}`);
        }
        if (dungeonCurrentHP <= 0) battleResult = 'victoria';
      } else {
        combatLog.push('--- Turno de la Mazmorra ---');
        const missed = Math.random() < dungeon.probabilidades.fallo_ataque_propio;
        if (missed) {
          combatLog.push('¡La mazmorra ha fallado su ataque!');
        } else {
          const damage = Math.max(1, dungeon.stats.ataque - teamDEF);
          const livingCharacters = combatTeam.filter(c => c.saludActual > 0);
          if (livingCharacters.length > 0) {
            const damagePerCharacter = Math.ceil(damage / livingCharacters.length);
            combatLog.push(`La mazmorra ataca y causa ${damage} de daño total.`);
            livingCharacters.forEach(char => {
              char.saludActual -= damagePerCharacter;
              combatLog.push(` -> ${char.personajeId} recibe ${damagePerCharacter} de daño. Salud restante: ${Math.max(0, char.saludActual)}`);
            });
          }
        }
        if (combatTeam.every(c => c.saludActual <= 0)) battleResult = 'derrota';
      }
      playerTurn = !playerTurn;
    }

    // --- 5. Resolución del Combate y Recompensas ---
    let earnedLoot: any[] = [];
    let totalExpGanada = 0;

    if (battleResult === 'victoria') {
      combatLog.push('¡VICTORIA! Has superado la mazmorra.');
      
      // --- Ganancia de Experiencia y Subida de Nivel ---
      const baseExp = dungeon.recompensas.expBase * gameSettings.EXP_GLOBAL_MULTIPLIER;
      combatLog.push(`Experiencia base por victoria: ${baseExp}.`);

      for (const char of combatTeam) {
        let finalExp = baseExp;
        const now = new Date();
        let totalXpBonus = 0;

        // Buscamos buffs de XP en el personaje y los sumamos
        char.activeBuffs.forEach(buff => {
          if (buff.expiresAt > now && buff.effects.mejora_xp_porcentaje) {
            totalXpBonus += buff.effects.mejora_xp_porcentaje;
          }
        });

        if (totalXpBonus > 0) {
          finalExp = finalExp * (1 + totalXpBonus / 100);
          combatLog.push(` -> ${char.personajeId} tiene un bonus de ${totalXpBonus}% XP! Gana ${Math.round(finalExp)} de experiencia.`);
        } else {
          combatLog.push(` -> ${char.personajeId} gana ${Math.round(finalExp)} de experiencia.`);
        }
        
        const expIndividual = Math.round(finalExp);
        char.progreso += expIndividual;
        totalExpGanada += expIndividual; // Sumar al total para el log

        const levelUpResult = handleLevelUp(char, levelRequirements, gameSettings);
        if (levelUpResult.leveledUp) {
          combatLog.push(...levelUpResult.log);
        }
      }

      // --- LÓGICA DE BOTÍN (LOOT) ACTUALIZADA ---
      const possibleDropIds = dungeon.recompensas.dropTable.map(d => d.itemId);
  const possibleItemsInfo = await Item.find({ '_id': { $in: possibleDropIds } });
  const itemsInfoMap = new Map(possibleItemsInfo.map(item => [String((item as any)._id), item]));

      for (const drop of dungeon.recompensas.dropTable) {
        if (Math.random() < drop.probabilidad) {
          const itemInfo = itemsInfoMap.get(String(drop.itemId));
          if (!itemInfo) {
            combatLog.push(`Advertencia: Se intentó dropear un item con ID ${drop.itemId} pero no se encontró.`);
            continue;
          }

          earnedLoot.push({ itemId: drop.itemId, nombre: itemInfo.nombre });

          const genericItemInfo = itemInfo as any;
          if (genericItemInfo.tipoItem === 'Equipment') {
            if (user.inventarioEquipamiento.length < user.limiteInventarioEquipamiento) {
              user.inventarioEquipamiento.push(drop.itemId);
              combatLog.push(`¡Has obtenido un equipo: ${itemInfo.nombre}!`);
            } else {
              combatLog.push(`Has encontrado un equipo (${itemInfo.nombre}), pero tu inventario de equipamiento está lleno.`);
            }
          } else if (genericItemInfo.tipoItem === 'Consumable') {
            if (user.inventarioConsumibles.length < user.limiteInventarioConsumibles) {
              const consumableInfo = itemInfo as unknown as IConsumable;
              user.inventarioConsumibles.push({
                consumableId: drop.itemId,
                usos_restantes: consumableInfo.usos_maximos || 1
              });
              combatLog.push(`¡Has obtenido un consumible: ${itemInfo.nombre}!`);
            } else {
              combatLog.push(`Has encontrado un consumible (${itemInfo.nombre}), pero tu inventario de consumibles está lleno.`);
            }
          }
        }
      }

      // --- Registrar estadística de la victoria ---
      await PlayerStat.create({
        userId: user._id,
        personajeId: combatTeam.map(p => p.personajeId).join(', '),
        fecha: new Date(),
        valAcumulado: baseExp, // Guardamos la exp base como referencia
        fuente: `victoria_mazmorra_${dungeon.nombre}`
      });

    } else {
      combatLog.push('DERROTA... Tu equipo ha sido vencido.');
    }

    // --- 6. Actualizar Estado de Personajes ---
    combatTeam.forEach(char => {
        const characterInUser = user.personajes.id(char._id);
        if (characterInUser) {
            if (char.saludActual <= 0) {
                characterInUser.saludActual = 0;
                characterInUser.estado = 'herido';
                characterInUser.fechaHerido = new Date();
            } else {
                characterInUser.saludActual = char.saludActual;
            }
        }
    });

    await user.save();

    // --- 7. Enviar Respuesta ---
    res.json({
      resultado: battleResult,
      log: combatLog,
      recompensas: {
        expGanada: totalExpGanada, // Se reporta la suma total de exp
        botinObtenido: earnedLoot
      },
      estadoEquipo: combatTeam.map(c => ({
        personajeId: c.personajeId,
        saludFinal: Math.max(0, c.saludActual),
        nivelFinal: c.nivel,
        estado: c.saludActual <= 0 ? 'herido' : 'saludable'
      }))
    });

  } catch (error) {
    console.error('Error al iniciar la mazmorra:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};