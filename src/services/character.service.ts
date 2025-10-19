import { IPersonajeSubdocument } from '../models/User';
import { ILevelRequirement } from '../models/LevelRequirement';
import { IGameSetting } from '../models/GameSetting';

/**
 * Maneja la lógica de subida de nivel para un personaje.
 * Comprueba si el progreso del personaje es suficiente para subir de nivel y actualiza sus estadísticas.
 * Puede manejar múltiples subidas de nivel en una sola llamada.
 * 
 * @param character El subdocumento del personaje a procesar.
 * @param levelRequirements Una lista de todos los requisitos de nivel del juego.
 * @param gameSettings La configuración del juego, que incluye los aumentos de estadísticas por nivel.
 * @returns Un objeto que contiene si el personaje subió de nivel y un log de los eventos.
 */
export const handleLevelUp = (
  character: IPersonajeSubdocument,
  levelRequirements: ILevelRequirement[],
  gameSettings: IGameSetting
): { leveledUp: boolean; log: string[] } => {

  let leveledUp = false;
  const levelUpLog: string[] = [];
  const maxLevel = gameSettings.nivel_maximo_personaje || 100;

  // Bucle para manejar múltiples subidas de nivel si hay suficiente EXP acumulada
  while (character.nivel < maxLevel) {
    const currentLevelReq = levelRequirements.find(req => req.nivel === character.nivel);

    // Si no se encuentran requisitos para el nivel actual, no se puede subir de nivel.
    if (!currentLevelReq) {
      levelUpLog.push(`No se encontraron requisitos de nivel para el nivel ${character.nivel}. Deteniendo.`);
      break;
    }

    const expNeeded = currentLevelReq.experiencia_requerida;

    // Comprobar si el personaje tiene suficiente experiencia
    if (character.progreso >= expNeeded) {
      leveledUp = true;

      // 1. Restar la experiencia requerida
      character.progreso -= expNeeded;

      // 2. Incrementar el nivel
      character.nivel += 1;
      levelUpLog.push(`${character.personajeId} ha subido al nivel ${character.nivel}!`);

      // 3. Aumentar las estadísticas base según el rango del personaje
      const statIncrease = gameSettings.aumento_stats_por_nivel[character.rango];
      if (statIncrease) {
        character.stats.atk += statIncrease.atk;
        character.stats.vida += statIncrease.vida;
        character.stats.defensa += statIncrease.defensa;
        
        // 4. Actualizar y curar la salud
        character.saludMaxima = character.stats.vida;
        character.saludActual = character.saludMaxima; // Curación completa al subir de nivel

        levelUpLog.push(` -> Estadísticas aumentadas: ATK +${statIncrease.atk}, Vida +${statIncrease.vida}, DEF +${statIncrease.defensa}`);
      } else {
        levelUpLog.push(`Advertencia: No se encontró configuración de aumento de stats para el rango ${character.rango}.`);
      }

    } else {
      // Si no hay suficiente EXP, detener el bucle
      break;
    }
  }

  return { leveledUp, log: levelUpLog };
};