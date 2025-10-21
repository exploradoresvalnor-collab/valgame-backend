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

    // Aplicar multiplicador por rango si existe en gameSettings
    let expNeededBase = currentLevelReq.experiencia_requerida;
    let expReqMultiplier = 1;
    try {
      const map = (gameSettings as any).exp_req_multiplier_por_rango;
      if (map) {
        if (typeof map === 'object' && map[character.rango] != null) {
          expReqMultiplier = Number(map[character.rango]) || 1;
        } else if (typeof map.get === 'function') {
          const val = map.get(character.rango);
          if (val != null) expReqMultiplier = Number(val) || 1;
        }
      }
    } catch (err) {
      console.warn('Advertencia al leer exp_req_multiplier_por_rango:', (err as any)?.message || err);
    }

    const expNeeded = Math.ceil(expNeededBase * expReqMultiplier);

    // Comprobar si el personaje tiene suficiente experiencia
    if (character.progreso >= expNeeded) {
      leveledUp = true;

      // 1. Restar la experiencia requerida
      character.progreso -= expNeeded;

      // 2. Incrementar el nivel
      character.nivel += 1;
      levelUpLog.push(`${character.personajeId} ha subido al nivel ${character.nivel}!`);

      // 3. Aumentar las estadísticas base según el rango del personaje
      // Usar fallback defensivo si falta la configuración en GameSetting
      const DEFAULT_STAT_INCREASE = { atk: 1, vida: 5, defensa: 1 };
      let statIncrease = DEFAULT_STAT_INCREASE;
      try {
        const map = (gameSettings as any).aumento_stats_por_nivel;
        if (map && typeof map === 'object' && map[character.rango]) {
          statIncrease = map[character.rango];
        } else if (map && typeof map.get === 'function') {
          // Si es Map de Mongoose
          const val = (map as any).get(character.rango);
          if (val) statIncrease = val;
        } else {
          // No se encontró la configuración concreta
          console.warn(`Advertencia: No se encontró configuración de aumento de stats para el rango ${character.rango}. Usando fallback.`);
        }
      } catch (err) {
        console.warn('Advertencia al leer aumento_stats_por_nivel:', (err as any)?.message || err);
      }

      character.stats.atk += statIncrease.atk;
      character.stats.vida += statIncrease.vida;
      character.stats.defensa += statIncrease.defensa;

      // 4. Actualizar y curar la salud
      character.saludMaxima = character.stats.vida;
      character.saludActual = character.saludMaxima; // Curación completa al subir de nivel

      levelUpLog.push(` -> Estadísticas aumentadas: ATK +${statIncrease.atk}, Vida +${statIncrease.vida}, DEF +${statIncrease.defensa}`);

    } else {
      // Si no hay suficiente EXP, detener el bucle
      break;
    }
  }

  return { leveledUp, log: levelUpLog };
};

// ------------------- Helpers exportados -------------------
function getMultiplier(map: any, rango: string, fallback = 1): number {
  if (!map) return fallback;
  try {
    if (typeof map === 'object' && Object.prototype.hasOwnProperty.call(map, rango)) {
      const v = map[rango];
      return Number(v) || fallback;
    }
    if (typeof map.get === 'function') {
      const v = map.get(rango);
      return Number(v) || fallback;
    }
  } catch (err) {
    // ignore and fallback
  }
  return fallback;
}

export function calcularXpPorRango(
  nivel: number,
  rango: string,
  levelReqObj: { experiencia_requerida: number },
  expBase: number,
  settings: any
) {
  const expReqBase = levelReqObj?.experiencia_requerida ?? 0;
  const expReqMultiplier = getMultiplier(settings?.exp_req_multiplier_por_rango, rango, 1.0);
  const expGainMultiplier = getMultiplier(settings?.exp_gain_multiplier_por_rango, rango, 1.0);
  const globalMultiplier = settings?.EXP_GLOBAL_MULTIPLIER ?? 1.0;

  const xpReqEffective = Math.ceil(expReqBase * expReqMultiplier);
  const xpGainEffective = Math.ceil(expBase * expGainMultiplier * globalMultiplier);
  const victoriasEstimadas = xpGainEffective > 0 ? Math.ceil(xpReqEffective / xpGainEffective) : Infinity;

  return {
    xpReqEffective,
    xpGainEffective,
    victoriasEstimadas,
    expReqMultiplier,
    expGainMultiplier,
    globalMultiplier
  };
}
