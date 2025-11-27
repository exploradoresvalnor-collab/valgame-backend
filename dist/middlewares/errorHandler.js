"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || 'Internal Server Error';
    // Log detallado para depuración
    console.error('\n==================== UNHANDLED ERROR ====================');
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.error('Error Message:', message);
    console.error('Error Status:', status);
    console.error('Error Type:', err.constructor.name);
    // Imprimir el stack trace si está disponible
    if (err.stack) {
        console.error('Stack Trace:');
        console.error(err.stack);
    }
    else {
        console.error('Full Error Object:', err);
    }
    console.error('=========================================================\n');
    // Detectar si es un error de conexión
    const isConnectionError = err.constructor.name === 'ConnectionError' ||
        err.constructor.name === 'OfflineError' ||
        err.constructor.name === 'TimeoutError' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'ENOTFOUND' ||
        err.code === 'ETIMEDOUT' ||
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('ENOTFOUND') ||
        err.message?.includes('ETIMEDOUT') ||
        status === 503 ||
        status === 504;
    // Construir respuesta de error
    const errorResponse = {
        ok: false,
        error: message,
        code: err.constructor.name,
        status,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        ...(isConnectionError && {
            isOffline: err.isOffline || false,
            isConnectionError: true,
            retryable: err.retryable !== false,
            attemptCount: err.attemptCount || 0,
            maxAttempts: err.maxAttempts || 3,
            suggestedAction: err.suggestedAction || 'retry'
        }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    // Headers adicionales para errores de conexión
    if (isConnectionError) {
        res.setHeader('X-Connection-Error', 'true');
        res.setHeader('X-Retry-After', '5'); // Segundos antes de reintentar
        res.setHeader('X-Offline-Indicator', 'show');
    }
    res.status(status).json(errorResponse);
};
exports.default = errorHandler;
