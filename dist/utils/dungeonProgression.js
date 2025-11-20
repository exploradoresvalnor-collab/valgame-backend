"use strict";
/**
 * ═══════════════════════════════════════════════════════════════
 * UTILIDADES PARA PROGRESIÓN DE MAZMORRAS
 * ═══════════════════════════════════════════════════════════════
 * Sistema de puntos acumulados para subir nivel de mazmorra
 * Inspirado en Monster Hunter y Path of Exile
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPuntosRequeridos = calcularPuntosRequeridos;
exports.calcularPuntosVictoria = calcularPuntosVictoria;
exports.calcularTiempoEstimado = calcularTiempoEstimado;
exports.procesarVictoria = procesarVictoria;
exports.calcularStatsEscaladas = calcularStatsEscaladas;
exports.calcularRecompensasEscaladas = calcularRecompensasEscaladas;
exports.calcularMultiplicadorDrop = calcularMultiplicadorDrop;
/**
 * Calcula los puntos requeridos para alcanzar el siguiente nivel de mazmorra
 * Usa progresión exponencial 1.5x (mismo sistema que personajes)
 *
 * @param nivelActual - Nivel actual de la mazmorra (1, 2, 3, ...)
 * @returns Puntos requeridos para subir al siguiente nivel
 *
 * @example
 * calcularPuntosRequeridos(1) // 100 puntos para nivel 2
 * calcularPuntosRequeridos(2) // 150 puntos para nivel 3
 * calcularPuntosRequeridos(5) // ~506 puntos para nivel 6
 * calcularPuntosRequeridos(10) // ~3837 puntos para nivel 11
 */
function calcularPuntosRequeridos(nivelActual) {
    const basePoints = 100;
    const exponent = 1.5;
    // Fórmula: 100 × (1.5 ^ (nivel_actual - 1))
    const puntosRequeridos = Math.floor(basePoints * Math.pow(exponent, nivelActual - 1));
    return puntosRequeridos;
}
/**
 * Calcula los puntos otorgados por una victoria en mazmorra
 * Considera: tiempo de victoria, salud restante del personaje, racha de victorias
 *
 * @param tiempoSegundos - Tiempo que tardó en completar la mazmorra (segundos)
 * @param tiempoEstimado - Tiempo estimado para completar (segundos) - usado para bonus
 * @param saludRestantePorcentaje - Salud restante del personaje (0-100)
 * @param rachaActual - Victorias consecutivas actuales (0, 1, 2, 3...)
 * @returns Puntos de mazmorra otorgados
 *
 * @example
 * // Victoria normal (3 min, 50% HP, sin racha)
 * calcularPuntosVictoria(180, 300, 50, 0) // ~35 puntos
 *
 * // Victoria rápida perfecta (1 min, 90% HP, racha 5)
 * calcularPuntosVictoria(60, 300, 90, 5) // ~75 puntos
 *
 * // Victoria lenta pero sobrevivió (10 min, 10% HP, sin racha)
 * calcularPuntosVictoria(600, 300, 10, 0) // ~31 puntos
 */
function calcularPuntosVictoria(tiempoSegundos, tiempoEstimado, saludRestantePorcentaje, rachaActual) {
    let puntos = 30; // Base mínima por victoria
    // ═══════════════════════════════════════════════════════════════
    // BONUS POR TIEMPO (0-20 puntos)
    // ═══════════════════════════════════════════════════════════════
    // Si terminas en menos del tiempo estimado, obtienes bonus
    // Mientras más rápido, más bonus (máximo 20 puntos)
    const ratioTiempo = tiempoSegundos / tiempoEstimado;
    if (ratioTiempo <= 0.5) {
        // Ultra rápido: 50% o menos del tiempo estimado
        puntos += 20;
    }
    else if (ratioTiempo <= 0.7) {
        // Muy rápido: 70% del tiempo
        puntos += 15;
    }
    else if (ratioTiempo <= 0.9) {
        // Rápido: 90% del tiempo
        puntos += 10;
    }
    else if (ratioTiempo <= 1.2) {
        // Normal: dentro del rango esperado
        puntos += 5;
    }
    // Si tardas más de 1.2x el tiempo estimado, no hay bonus
    // ═══════════════════════════════════════════════════════════════
    // BONUS POR SALUD RESTANTE (0-15 puntos)
    // ═══════════════════════════════════════════════════════════════
    // Mientras más HP conserves, mejor
    if (saludRestantePorcentaje >= 90) {
        puntos += 15; // Casi sin daño
    }
    else if (saludRestantePorcentaje >= 70) {
        puntos += 10; // Poco daño
    }
    else if (saludRestantePorcentaje >= 50) {
        puntos += 5; // Daño moderado
    }
    else if (saludRestantePorcentaje >= 30) {
        puntos += 2; // Bastante daño
    }
    // Menos de 30% HP: no hay bonus (sobreviviste por poco)
    // ═══════════════════════════════════════════════════════════════
    // BONUS POR RACHA (5 puntos cada 3 victorias)
    // ═══════════════════════════════════════════════════════════════
    // Recompensa por consistencia
    const bonusRacha = Math.floor(rachaActual / 3) * 5;
    puntos += bonusRacha;
    return Math.floor(puntos);
}
/**
 * Calcula el tiempo estimado para completar una mazmorra según sus stats
 * Usado como referencia para calcular bonus de velocidad
 *
 * @param vidaBoss - HP del boss de la mazmorra
 * @param ataqueBoss - Ataque del boss
 * @returns Tiempo estimado en segundos
 *
 * @example
 * calcularTiempoEstimado(150, 15) // Cueva Goblins: ~90 segundos
 * calcularTiempoEstimado(3000, 120) // Abismo: ~420 segundos
 */
function calcularTiempoEstimado(vidaBoss, ataqueBoss) {
    // Fórmula heurística basada en dificultad
    // Asume ~20 DPS promedio del jugador + consideración de defensa
    const baseTime = vidaBoss / 25; // Asume 25 DPS aproximado
    const difficultyMultiplier = 1 + (ataqueBoss / 200); // Boss más fuerte = más cauteloso
    return Math.floor(baseTime * difficultyMultiplier);
}
/**
 * Procesa una victoria en mazmorra y actualiza el progreso
 * Maneja la subida de nivel automática si se alcanza el umbral
 *
 * @param progresoActual - Objeto con el progreso actual de la mazmorra
 * @param puntosGanados - Puntos obtenidos por esta victoria
 * @returns Objeto actualizado con nuevo progreso y flag de subida de nivel
 *
 * @example
 * const progreso = { nivel_actual: 1, puntos_acumulados: 80, puntos_requeridos_siguiente_nivel: 100, ... };
 * const resultado = procesarVictoria(progreso, 35);
 * // resultado.subiDeNivel = true
 * // resultado.progreso.nivel_actual = 2
 * // resultado.progreso.puntos_acumulados = 15 (sobrante)
 * // resultado.progreso.puntos_requeridos_siguiente_nivel = 150
 */
function procesarVictoria(progresoActual, puntosGanados, tiempoVictoria) {
    let subiDeNivel = false;
    let nivelesSubidos = 0;
    // Actualizar stats básicas
    const nuevoProgreso = {
        ...progresoActual,
        victorias: progresoActual.victorias + 1,
        puntos_acumulados: progresoActual.puntos_acumulados + puntosGanados,
        mejor_tiempo: progresoActual.mejor_tiempo === 0
            ? tiempoVictoria
            : Math.min(progresoActual.mejor_tiempo, tiempoVictoria),
        ultima_victoria: new Date()
    };
    // Verificar si subió de nivel (puede subir varios niveles a la vez)
    while (nuevoProgreso.puntos_acumulados >= nuevoProgreso.puntos_requeridos_siguiente_nivel) {
        // Restar puntos usados
        nuevoProgreso.puntos_acumulados -= nuevoProgreso.puntos_requeridos_siguiente_nivel;
        // Subir nivel
        nuevoProgreso.nivel_actual += 1;
        nivelesSubidos += 1;
        subiDeNivel = true;
        // Calcular nuevos puntos requeridos para el siguiente nivel
        nuevoProgreso.puntos_requeridos_siguiente_nivel = calcularPuntosRequeridos(nuevoProgreso.nivel_actual);
    }
    return {
        progreso: nuevoProgreso,
        subiDeNivel,
        nivelesSubidos
    };
}
/**
 * Calcula las stats escaladas de una mazmorra según su nivel
 *
 * @param statsBase - Stats base de la mazmorra
 * @param nivelMazmorra - Nivel actual de la mazmorra para el usuario
 * @param multiplicadores - Multiplicadores de nivel_sistema
 * @returns Stats escaladas
 */
function calcularStatsEscaladas(statsBase, nivelMazmorra, multiplicadores) {
    const multiplicador = 1 + (multiplicadores.multiplicador_stats_por_nivel * (nivelMazmorra - 1));
    return {
        vida: Math.floor(statsBase.vida * multiplicador),
        ataque: Math.floor(statsBase.ataque * multiplicador),
        defensa: Math.floor(statsBase.defensa * multiplicador)
    };
}
/**
 * Calcula las recompensas escaladas de una mazmorra según su nivel
 *
 * @param recompensasBase - Recompensas base de la mazmorra
 * @param nivelMazmorra - Nivel actual de la mazmorra para el usuario
 * @param multiplicadores - Multiplicadores de nivel_sistema
 * @returns Recompensas escaladas
 */
function calcularRecompensasEscaladas(recompensasBase, nivelMazmorra, multiplicadores) {
    const multiplicadorXP = 1 + (multiplicadores.multiplicador_xp_por_nivel * (nivelMazmorra - 1));
    const multiplicadorVAL = 1 + (multiplicadores.multiplicador_val_por_nivel * (nivelMazmorra - 1));
    return {
        exp: Math.floor(recompensasBase.expBase * multiplicadorXP),
        val: Math.floor(recompensasBase.valBase * multiplicadorVAL)
    };
}
/**
 * Calcula el multiplicador de drop según el nivel de mazmorra
 * Tiene un cap de 2x para evitar que sea demasiado fácil
 *
 * @param nivelMazmorra - Nivel actual de la mazmorra
 * @param multiplicadorPorNivel - Multiplicador por nivel (ej: 0.05 = +5% por nivel)
 * @returns Multiplicador de probabilidad de drop (1.0 - 2.0)
 */
function calcularMultiplicadorDrop(nivelMazmorra, multiplicadorPorNivel) {
    const multiplicador = 1 + (multiplicadorPorNivel * (nivelMazmorra - 1));
    // Cap de 2x (nivel 21 con mult 0.05)
    return Math.min(multiplicador, 2.0);
}
