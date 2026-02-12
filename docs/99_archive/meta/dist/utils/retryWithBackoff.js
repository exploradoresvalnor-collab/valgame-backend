"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetryExecutor = exports.RETRY_PRESETS = exports.isRetryable = exports.sleep = exports.calculateDelay = exports.DEFAULT_RETRY_CONFIG = void 0;
exports.retryWithBackoff = retryWithBackoff;
exports.retryOnce = retryOnce;
/**
 * Configuración por defecto para reintentos
 */
exports.DEFAULT_RETRY_CONFIG = {
    maxAttempts: 3,
    baseDelayMs: 1000, // 1 segundo
    maxDelayMs: 30000, // 30 segundos
    backoffMultiplier: 2, // Duplicar el delay en cada reintento
    jitter: true, // Agregar variación aleatoria
    retryableStatusCodes: [408, 429, 500, 502, 503, 504] // Timeout, Rate limit, Server errors
};
/**
 * Calcula el delay para el próximo reintento
 * Usa backoff exponencial con jitter opcional
 */
const calculateDelay = (attempt, config = {}) => {
    const finalConfig = { ...exports.DEFAULT_RETRY_CONFIG, ...config };
    // Backoff exponencial
    let delay = finalConfig.baseDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1);
    // Limitar al máximo
    delay = Math.min(delay, finalConfig.maxDelayMs);
    // Agregar jitter (variación aleatoria entre 0 y delay)
    if (finalConfig.jitter) {
        delay += Math.random() * delay * 0.1; // Agregar 10% de variación
    }
    return delay;
};
exports.calculateDelay = calculateDelay;
/**
 * Función auxiliar para esperar
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
/**
 * Verifica si un error es retryable
 */
const isRetryable = (error, config = {}) => {
    const finalConfig = { ...exports.DEFAULT_RETRY_CONFIG, ...config };
    // Errores de conexión son retryables
    const connectionErrors = [
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        'ECONNRESET',
        'EHOSTUNREACH',
        'ENETUNREACH'
    ];
    if (connectionErrors.includes(error.code)) {
        return true;
    }
    // Códigos de estado HTTP retryables
    if (error.response?.status) {
        return finalConfig.retryableStatusCodes.includes(error.response.status);
    }
    // Timeout
    if (error.message?.includes('timeout')) {
        return true;
    }
    return false;
};
exports.isRetryable = isRetryable;
/**
 * Ejecuta una función con reintentos automáticos
 * @param fn Función a ejecutar
 * @param config Configuración de reintentos
 * @param onRetry Callback ejecutado antes de cada reintento
 * @returns El resultado de la función si tiene éxito
 * @throws Error si todos los reintentos fallan
 */
async function retryWithBackoff(fn, config = {}, onRetry) {
    const finalConfig = { ...exports.DEFAULT_RETRY_CONFIG, ...config };
    let lastError;
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            // Si es el último intento o el error no es retryable, lanzar
            if (attempt === finalConfig.maxAttempts || !(0, exports.isRetryable)(error, config)) {
                throw error;
            }
            // Calcular delay y notificar
            const delayMs = (0, exports.calculateDelay)(attempt, finalConfig);
            const retryState = {
                attempt,
                lastError,
                nextRetryDelayMs: delayMs
            };
            if (onRetry) {
                onRetry(retryState);
            }
            console.warn(`[Retry] Attempt ${attempt}/${finalConfig.maxAttempts} failed. ` +
                `Retrying in ${delayMs}ms...`, error instanceof Error ? error.message : error);
            // Esperar antes de reintentar
            await (0, exports.sleep)(delayMs);
        }
    }
    // No debería llegar aquí
    throw lastError || new Error('Retry exhausted');
}
/**
 * Versión simplificada para retryar una vez
 */
async function retryOnce(fn, delayMs = 1000) {
    try {
        return await fn();
    }
    catch (error) {
        if (!(0, exports.isRetryable)(error)) {
            throw error;
        }
        console.warn(`[Retry] First attempt failed. Retrying in ${delayMs}ms...`);
        await (0, exports.sleep)(delayMs);
        return fn();
    }
}
/**
 * Configuración presets para casos comunes
 */
exports.RETRY_PRESETS = {
    // Rápido: 3 reintentos, delay corto
    FAST: {
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 2000,
        backoffMultiplier: 2,
        jitter: true
    },
    // Normal: 4 reintentos, delay medio
    NORMAL: {
        maxAttempts: 4,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitter: true
    },
    // Paciente: 5 reintentos, delay largo
    PATIENT: {
        maxAttempts: 5,
        baseDelayMs: 2000,
        maxDelayMs: 60000,
        backoffMultiplier: 2,
        jitter: true
    },
    // Agresivo: 2 reintentos, delay muy corto
    AGGRESSIVE: {
        maxAttempts: 2,
        baseDelayMs: 500,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
        jitter: false
    }
};
/**
 * Helper para crear un retry executor configurado
 */
const createRetryExecutor = (preset = 'NORMAL') => {
    return (fn) => retryWithBackoff(fn, exports.RETRY_PRESETS[preset]);
};
exports.createRetryExecutor = createRetryExecutor;
exports.default = retryWithBackoff;
