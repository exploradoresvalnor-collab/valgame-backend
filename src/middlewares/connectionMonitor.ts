import { Request, Response, NextFunction } from 'express';
import { OfflineError, ConnectionError } from '../utils/errors';

/**
 * Middleware para monitorear la conexión
 * - Detecta si el servidor está accesible desde el cliente
 * - Marca respuestas con headers de estado de conexión
 * - Permite reintentos automáticos en caso de fallo
 */

interface ConnectionState {
  isOnline: boolean;
  lastCheck: Date;
  failureCount: number;
  consecutiveFailures: number;
}

const connectionState: ConnectionState = {
  isOnline: true,
  lastCheck: new Date(),
  failureCount: 0,
  consecutiveFailures: 0
};

/**
 * Simula un health check de conexión
 * En producción, podría hacer ping a la BD o verificar servicios externos
 */
const checkConnection = async (): Promise<boolean> => {
  try {
    // Verificar conexión a MongoDB
    const globalWithMongoose = global as any;
    if (globalWithMongoose.mongoose?.connection?.readyState !== 1) {
      throw new Error('MongoDB connection failed');
    }
    return true;
  } catch (error) {
    console.warn('[Connection Monitor] Health check failed:', error);
    return false;
  }
};

/**
 * Middleware que verifica estado de conexión antes de procesar
 */
export const connectionMonitorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Solo hacer health check cada 30 segundos
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - connectionState.lastCheck.getTime();

    if (timeSinceLastCheck > 30000) {
      const isConnected = await checkConnection();
      connectionState.lastCheck = now;

      if (!isConnected) {
        connectionState.consecutiveFailures++;
        connectionState.failureCount++;

        // Si hay más de 2 fallos consecutivos, marcar como offline
        if (connectionState.consecutiveFailures > 2) {
          connectionState.isOnline = false;
        }
      } else {
        connectionState.consecutiveFailures = 0;
        connectionState.isOnline = true;
      }
    }

    // Agregar estado de conexión a la respuesta
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      const enrichedData = {
        ...data,
        _connection: {
          isOnline: connectionState.isOnline,
          timestamp: new Date().toISOString()
        }
      };
      return originalJson(enrichedData);
    };

    // Agregar headers de diagnóstico
    res.setHeader('X-Connection-Status', connectionState.isOnline ? 'online' : 'degraded');
    res.setHeader('X-Server-Time', new Date().toISOString());

    next();
  } catch (error) {
    console.error('[Connection Monitor] Error in middleware:', error);
    // Continuar incluso si hay error en el monitoreo
    next();
  }
};

/**
 * Middleware para detectar patrones de error de conexión
 * Útil para identificar problemas de red del lado del cliente
 */
export const detectConnectionErrors = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Códigos de error que indican problema de conexión
  const connectionErrorCodes = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'EHOSTUNREACH',
    'ENETUNREACH'
  ];

  const isConnectionIssue =
    connectionErrorCodes.includes(err.code) ||
    err.message?.includes('timeout') ||
    err.message?.includes('ECONNREFUSED') ||
    err.statusCode === 503 ||
    err.statusCode === 504;

  if (isConnectionIssue) {
    // Log del error de conexión
    console.warn(
      `[Connection Error] ${req.method} ${req.path} - ${err.code}: ${err.message}`
    );

    // Crear error de conexión enriquecido
    const connectionError = new ConnectionError(
      'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.',
      true, // retryable
      (err.attemptCount || 0) + 1,
      3 // maxAttempts
    );

    return next(connectionError);
  }

  next(err);
};

/**
 * Obtener estado actual de conexión
 */
export const getConnectionStatus = () => ({
  isOnline: connectionState.isOnline,
  failureCount: connectionState.failureCount,
  consecutiveFailures: connectionState.consecutiveFailures,
  lastCheck: connectionState.lastCheck
});

/**
 * Reset manual del estado de conexión (útil para debugging)
 */
export const resetConnectionState = () => {
  connectionState.isOnline = true;
  connectionState.failureCount = 0;
  connectionState.consecutiveFailures = 0;
  connectionState.lastCheck = new Date();
  console.log('[Connection Monitor] State reset');
};

export default connectionMonitorMiddleware;
