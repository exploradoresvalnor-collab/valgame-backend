/**
 * Configuración para reintentos con backoff exponencial
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableStatusCodes: number[];
}

/**
 * Estado de un reintento
 */
export interface RetryState {
  attempt: number;
  lastError?: Error;
  nextRetryDelayMs?: number;
}

/**
 * Configuración por defecto para reintentos
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
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
export const calculateDelay = (
  attempt: number,
  config: Partial<RetryConfig> = {}
): number => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

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

/**
 * Función auxiliar para esperar
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Verifica si un error es retryable
 */
export const isRetryable = (
  error: any,
  config: Partial<RetryConfig> = {}
): boolean => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

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

/**
 * Ejecuta una función con reintentos automáticos
 * @param fn Función a ejecutar
 * @param config Configuración de reintentos
 * @param onRetry Callback ejecutado antes de cada reintento
 * @returns El resultado de la función si tiene éxito
 * @throws Error si todos los reintentos fallan
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (state: RetryState) => void
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Si es el último intento o el error no es retryable, lanzar
      if (attempt === finalConfig.maxAttempts || !isRetryable(error, config)) {
        throw error;
      }

      // Calcular delay y notificar
      const delayMs = calculateDelay(attempt, finalConfig);

      const retryState: RetryState = {
        attempt,
        lastError,
        nextRetryDelayMs: delayMs
      };

      if (onRetry) {
        onRetry(retryState);
      }

      console.warn(
        `[Retry] Attempt ${attempt}/${finalConfig.maxAttempts} failed. ` +
        `Retrying in ${delayMs}ms...`,
        error instanceof Error ? error.message : error
      );

      // Esperar antes de reintentar
      await sleep(delayMs);
    }
  }

  // No debería llegar aquí
  throw lastError || new Error('Retry exhausted');
}

/**
 * Versión simplificada para retryar una vez
 */
export async function retryOnce<T>(
  fn: () => Promise<T>,
  delayMs: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isRetryable(error)) {
      throw error;
    }

    console.warn(`[Retry] First attempt failed. Retrying in ${delayMs}ms...`);
    await sleep(delayMs);
    return fn();
  }
}

/**
 * Configuración presets para casos comunes
 */
export const RETRY_PRESETS = {
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
export const createRetryExecutor = (preset: keyof typeof RETRY_PRESETS = 'NORMAL') => {
  return (fn: () => Promise<any>) => retryWithBackoff(fn, RETRY_PRESETS[preset]);
};

export default retryWithBackoff;
