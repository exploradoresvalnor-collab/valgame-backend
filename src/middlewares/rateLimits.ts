import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utils/errors';
import { Request, Response } from 'express';

// Tipo para el registro de un IP
type IpRecord = {
  attempts: number;
  firstAttempt: Date;
  warnings: number;
};

// Almacenamiento en memoria para tracking (en producción usar Redis)
const rateLimitTracking = new Map<string, IpRecord>();

// Configuración de alertas
const ALERT_THRESHOLD = 3; // Número de veces que un IP puede exceder límites antes de alertar
const TRACKING_WINDOW = 60 * 60 * 1000; // 1 hora en ms

// Función para limpiar tracking antiguo
const cleanupTracking = () => {
  const now = new Date();
  for (const [ip, record] of rateLimitTracking.entries()) {
    if (now.getTime() - record.firstAttempt.getTime() > TRACKING_WINDOW) {
      rateLimitTracking.delete(ip);
    }
  }
};

// Limpieza periódica
if (process.env.NODE_ENV !== 'test') {
    setInterval(cleanupTracking, TRACKING_WINDOW);
}

// Función para manejar excesos de límite
const handleRateLimit = (req: Request, _res: Response, next: Function) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const record = rateLimitTracking.get(ip);
  
  if (!record) {
    rateLimitTracking.set(ip, {
      attempts: 1,
      firstAttempt: new Date(),
      warnings: 0
    });
  } else {
    record.attempts++;
    
    // Verificar si debemos emitir una alerta
    if (record.attempts >= ALERT_THRESHOLD) {
      record.warnings++;
      console.warn(`[RATE_LIMIT_ALERT] IP ${ip} ha excedido límites ${record.attempts} veces en la última hora`);
      
      // Aquí podrías integrar con un sistema de monitoreo externo
      if (process.env.MONITORING_WEBHOOK) {
        fetch(process.env.MONITORING_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rate_limit_alert',
            ip,
            attempts: record.attempts,
            warnings: record.warnings,
            path: req.path,
            timestamp: new Date()
          })
        }).catch(console.error);
      }
    }
  }

  next(new RateLimitError());
};

// Configuración base para todos los limitadores
const baseLimiterConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: handleRateLimit
};

// Limitador para rutas de autenticación
export const authLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de autenticación, por favor intente de nuevo en 15 minutos.'
});

// Limitador para acciones de juego rápidas
export const gameplayLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 peticiones por minuto
  message: 'Demasiadas acciones de juego, por favor espere un momento.'
});

// Limitador para acciones de juego lentas (mazmorras, evolución)
export const slowGameplayLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 peticiones por ventana
  message: 'Demasiadas acciones de juego complejas, por favor espere un momento.'
});

// Limitador para operaciones de mercado
export const marketplaceLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // 20 operaciones por ventana
  message: 'Demasiadas operaciones de mercado, por favor espere un momento.'
});

// Limitador general para la API
export const apiLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por ventana
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});