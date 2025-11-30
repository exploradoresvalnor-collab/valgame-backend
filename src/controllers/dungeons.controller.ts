import { Request, Response } from 'express';
import { User, IPersonajeSubdocument } from '../models/User';
import Dungeon from '../models/Dungeon';
import GameSettings from '../models/GameSetting';
import PlayerStat from '../models/PlayerStat'; // Importa el modelo PlayerStat
import { Ranking } from '../models/Ranking'; // Importa el modelo Ranking
import LevelRequirement from '../models/LevelRequirement'; // Importar requisitos de nivel
import { handleLevelUp } from '../services/character.service'; // Importar el nuevo servicio
import { IEquipment } from '../models/Equipment';
import { Item } from '../models/Item';
import { IConsumable } from '../models/Consumable';
import { 
  calcularPuntosVictoria, 
  calcularTiempoEstimado, 
  procesarVictoria,
  calcularStatsEscaladas,
  calcularRecompensasEscaladas,
  calcularMultiplicadorDrop
} from '../utils/dungeonProgression';

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
    // Validar que el usuario tenga boletos suficientes
    if (!user.boletos || user.boletos < 1) {
      return res.status(400).json({ error: 'No tienes boletos suficientes para entrar a la mazmorra. Compra más en la tienda.' });
    }

    if (team.length > gameSettings.MAX_PERSONAJES_POR_EQUIPO) {
        return res.status(400).json({ error: `El equipo no puede tener más de ${gameSettings.MAX_PERSONAJES_POR_EQUIPO} personajes.` });
    }

    // Validar que los personajes cumplan el nivel mínimo requerido
    const nivelRequerido = dungeon.nivel_requerido_minimo || 1;
    for (const charId of team) {
      const character = user.personajes.find(p => p.personajeId === charId);
      if (character && character.nivel < nivelRequerido) {
        return res.status(400).json({ 
          error: `El personaje ${character.personajeId} (nivel ${character.nivel}) no cumple el nivel mínimo requerido (${nivelRequerido}) para esta mazmorra.` 
        });
      }
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

    // --- Obtener o inicializar progreso de mazmorra para este usuario ---
    const dungeonIdStr = dungeonId.toString();
    if (!user.dungeon_progress) {
      user.dungeon_progress = new Map();
    }
    
    let dungeonProgress = user.dungeon_progress.get(dungeonIdStr);
    if (!dungeonProgress) {
      dungeonProgress = {
        victorias: 0,
        derrotas: 0,
        nivel_actual: 1,
        puntos_acumulados: 0,
        puntos_requeridos_siguiente_nivel: 100,
        mejor_tiempo: 0
      };
      user.dungeon_progress.set(dungeonIdStr, dungeonProgress);
    }

    // --- Calcular stats escaladas según nivel de mazmorra del usuario ---
    const statsEscaladas = calcularStatsEscaladas(
      dungeon.stats,
      dungeonProgress.nivel_actual,
      { multiplicador_stats_por_nivel: dungeon.nivel_sistema?.multiplicador_stats_por_nivel || 0.15 }
    );

    let dungeonCurrentHP = statsEscaladas.vida;
    const combatLog: string[] = [];
    combatLog.push(`🏰 Mazmorra Nivel ${dungeonProgress.nivel_actual}`);
    combatLog.push(`💪 Stats: ${statsEscaladas.vida} HP | ${statsEscaladas.ataque} ATK | ${statsEscaladas.defensa} DEF\n`);
    
    let playerTurn = true;
    let battleResult: 'victoria' | 'derrota' | 'en_curso' = 'en_curso';
    const combatStartTime = Date.now(); // Medir tiempo de combate

    // --- 4. El Bucle de Combate ---
    while (battleResult === 'en_curso') {
      if (playerTurn) {
        combatLog.push('--- Turno del Equipo ---');
        const missed = Math.random() < dungeon.probabilidades.fallo_ataque_jugador;
        if (missed) {
          combatLog.push('¡El equipo ha fallado su ataque!');
        } else {
          const damage = Math.max(1, teamATK - statsEscaladas.defensa);
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
          const damage = Math.max(1, statsEscaladas.ataque - teamDEF);
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
    let valGanado = 0;
    const combatDuration = Math.floor((Date.now() - combatStartTime) / 1000); // Duración en segundos
    let puntosGanados = 0;
    let progresoMazmorraResult: any = null;

    if (battleResult === 'victoria') {
      combatLog.push('¡VICTORIA! Has superado la mazmorra.');
      
      // --- Calcular recompensas escaladas ---
      const recompensasEscaladas = calcularRecompensasEscaladas(
        { expBase: dungeon.recompensas.expBase, valBase: dungeon.recompensas.valBase || 0 },
        dungeonProgress.nivel_actual,
        {
          multiplicador_xp_por_nivel: dungeon.nivel_sistema?.multiplicador_xp_por_nivel || 0.10,
          multiplicador_val_por_nivel: dungeon.nivel_sistema?.multiplicador_val_por_nivel || 0.10
        }
      );

      const baseExp = recompensasEscaladas.exp * gameSettings.EXP_GLOBAL_MULTIPLIER;
      valGanado = recompensasEscaladas.val;
      
      combatLog.push(`Experiencia base por victoria: ${baseExp}.`);
      combatLog.push(`VAL ganado: ${valGanado}.`);

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
      const multiplicadorDrop = calcularMultiplicadorDrop(
        dungeonProgress.nivel_actual,
        dungeon.nivel_sistema?.multiplicador_drop_por_nivel || 0.05
      );

      // Agregar items exclusivos al dropTable si el nivel es suficiente
      let dropTableCompleto = [...dungeon.recompensas.dropTable];
      const nivelMinimoExclusivos = dungeon.nivel_minimo_para_exclusivos || 20;
      
      if (dungeonProgress.nivel_actual >= nivelMinimoExclusivos) {
        if (dungeon.items_exclusivos && dungeon.items_exclusivos.length > 0) {
          combatLog.push(`🏆 Items exclusivos desbloqueados en esta mazmorra!`);
          dungeon.items_exclusivos.forEach(itemId => {
            dropTableCompleto.push({
              itemId,
              tipoItem: 'Equipment', // Asumimos que son equipment, se validará después
              probabilidad: 0.02 // 2% base para items exclusivos
            });
          });
        }
      }

      const possibleDropIds = dropTableCompleto.map(d => d.itemId);
      const possibleItemsInfo = await Item.find({ '_id': { $in: possibleDropIds } });
      const itemsInfoMap = new Map(possibleItemsInfo.map(item => [String((item as any)._id), item]));

      for (const drop of dropTableCompleto) {
        const probabilidadFinal = Math.min(drop.probabilidad * multiplicadorDrop, drop.probabilidad * 2); // Cap 2x
        if (Math.random() < probabilidadFinal) {
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

      // --- Otorgar VAL al usuario ---
      user.val += valGanado;

      // --- Sistema de Progresión de Mazmorra ---
      const saludRestantePorcentaje = combatTeam.reduce((sum, c) => sum + (c.saludActual / c.stats.vida) * 100, 0) / combatTeam.length;
      const tiempoEstimado = calcularTiempoEstimado(statsEscaladas.vida, statsEscaladas.ataque);
      
      puntosGanados = calcularPuntosVictoria(
        combatDuration,
        tiempoEstimado,
        saludRestantePorcentaje,
        user.dungeon_streak || 0
      );

      progresoMazmorraResult = procesarVictoria(dungeonProgress, puntosGanados, combatDuration);
      user.dungeon_progress!.set(dungeonIdStr, progresoMazmorraResult.progreso);

      combatLog.push(`\n🎯 Puntos de mazmorra ganados: ${puntosGanados}`);
      combatLog.push(`📊 Progreso: ${progresoMazmorraResult.progreso.puntos_acumulados}/${progresoMazmorraResult.progreso.puntos_requeridos_siguiente_nivel} pts (Nivel ${progresoMazmorraResult.progreso.nivel_actual})`);
      
      if (progresoMazmorraResult.subiDeNivel) {
        combatLog.push(`🎉 ¡Tu mazmorra subió ${progresoMazmorraResult.nivelesSubidos} nivel(es)! Ahora está en nivel ${progresoMazmorraResult.progreso.nivel_actual}`);
      }

      // --- Sistema de Racha ---
      user.dungeon_streak = (user.dungeon_streak || 0) + 1;
      if (user.dungeon_streak > (user.max_dungeon_streak || 0)) {
        user.max_dungeon_streak = user.dungeon_streak;
      }
      combatLog.push(`🔥 Racha actual: ${user.dungeon_streak} victoria(s) consecutiva(s)`);

      // --- Estadísticas de mazmorra ---
      if (!user.dungeon_stats) {
        user.dungeon_stats = { total_victorias: 0, total_derrotas: 0, mejor_racha: 0 };
      }
      user.dungeon_stats.total_victorias += 1;
      if (user.dungeon_streak > user.dungeon_stats.mejor_racha) {
        user.dungeon_stats.mejor_racha = user.dungeon_streak;
      }

      // --- Registrar estadística de la victoria ---
      await PlayerStat.create({
        userId: user._id,
        personajeId: combatTeam.map(p => p.personajeId).join(', '),
        fecha: new Date(),
        valAcumulado: valGanado,
        fuente: `victoria_mazmorra_${dungeon.nombre}`
      });

      // --- Actualizar Ranking ---
      const puntosRanking = gameSettings.puntos_ranking_por_victoria || 10;
      await Ranking.findOneAndUpdate(
        { userId: user._id, periodo: 'global' },
        { 
          $inc: { 
            puntos: puntosRanking,
            victorias: 1,
            boletosUsados: 1
          },
          $set: { 
            ultimaPartida: new Date()
          }
        },
        { upsert: true, new: true }
      );

    } else {
      combatLog.push('DERROTA... Tu equipo ha sido vencido.');
      
      // Resetear racha en derrota
      user.dungeon_streak = 0;
      
      // Incrementar contador de derrotas
      if (!user.dungeon_stats) {
        user.dungeon_stats = { total_victorias: 0, total_derrotas: 0, mejor_racha: 0 };
      }
      user.dungeon_stats.total_derrotas += 1;
      
      // Incrementar derrotas en progreso de mazmorra
      if (dungeonProgress) {
        dungeonProgress.derrotas += 1;
        user.dungeon_progress!.set(dungeonIdStr, dungeonProgress);
      }

      // --- Actualizar Ranking (derrota) ---
      await Ranking.findOneAndUpdate(
        { userId: user._id, periodo: 'global' },
        { 
          $inc: { 
            derrotas: 1,
            boletosUsados: 1
          },
          $set: { 
            ultimaPartida: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }

    // --- Restar boleto usado ---
    user.boletos -= 1;

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
        expGanada: totalExpGanada,
        valGanado: valGanado,
        botinObtenido: earnedLoot
      },
      progresionMazmorra: progresoMazmorraResult ? {
        puntosGanados: puntosGanados,
        nivelActual: progresoMazmorraResult.progreso.nivel_actual,
        puntosActuales: progresoMazmorraResult.progreso.puntos_acumulados,
        puntosRequeridos: progresoMazmorraResult.progreso.puntos_requeridos_siguiente_nivel,
        subiDeNivel: progresoMazmorraResult.subiDeNivel,
        nivelesSubidos: progresoMazmorraResult.nivelesSubidos
      } : null,
      rachaActual: user.dungeon_streak,
      tiempoCombate: combatDuration,
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

// Función para obtener detalles de una mazmorra específica
export const getDungeonDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id) {
      return res.status(400).json({ error: 'ID de mazmorra requerido.' });
    }

    // Buscar la mazmorra
    const dungeon = await Dungeon.findById(id);

    if (!dungeon) {
      return res.status(404).json({ error: 'Mazmorra no encontrada.' });
    }

    // Retornar detalles completos
    res.json({
      id: dungeon._id,
      nombre: dungeon.nombre,
      descripcion: dungeon.descripcion,
      nivel_requerido_minimo: dungeon.nivel_requerido_minimo || 1,
      stats: {
        vida: dungeon.stats.vida,
        ataque: dungeon.stats.ataque,
        defensa: dungeon.stats.defensa
      },
      probabilidades: {
        fallo_ataque_jugador: dungeon.probabilidades.fallo_ataque_jugador,
        fallo_ataque_propio: dungeon.probabilidades.fallo_ataque_propio
      },
      recompensas: {
        expBase: dungeon.recompensas.expBase,
        valBase: dungeon.recompensas.valBase,
        dropTable: dungeon.recompensas.dropTable ? dungeon.recompensas.dropTable.length : 0
      },
      nivel_sistema: {
        multiplicador_stats_por_nivel: dungeon.nivel_sistema.multiplicador_stats_por_nivel,
        multiplicador_val_por_nivel: dungeon.nivel_sistema.multiplicador_val_por_nivel,
        multiplicador_xp_por_nivel: dungeon.nivel_sistema.multiplicador_xp_por_nivel,
        multiplicador_drop_por_nivel: dungeon.nivel_sistema.multiplicador_drop_por_nivel,
        nivel_maximo_recomendado: dungeon.nivel_sistema.nivel_maximo_recomendado
      },
      personajes_exclusivos: dungeon.personajes_exclusivos || [],
      items_exclusivos: dungeon.items_exclusivos || [],
      nivel_minimo_para_exclusivos: dungeon.nivel_minimo_para_exclusivos || 1
    });

  } catch (error) {
    console.error('Error al obtener detalles de mazmorra:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};