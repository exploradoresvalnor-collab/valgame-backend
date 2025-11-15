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

// En entorno de testing queremos bypass el rate-limiter por defecto para evitar 429 en tests E2E.
// Para permitir activar el rate-limiter en un test concreto sin recargar módulos, creamos un handler
// dinámico que consulta la variable de entorno en tiempo de ejecución.
const noopHandler = (req: Request, _res: Response, next: Function) => next();

const dynamicHandler = (req: Request, res: Response, next: Function) => {
  // Si no estamos en test, siempre usar el handler real
  if (process.env.NODE_ENV !== 'test') return handleRateLimit(req, res, next);

  // En test, sólo activar si TEST_ENABLE_RATE_LIMIT === 'true'
  if (process.env.TEST_ENABLE_RATE_LIMIT === 'true') return handleRateLimit(req, res, next);

  return noopHandler(req, res, next);
};

// Configuración base para todos los limitadores
const baseLimiterConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: dynamicHandler
};

// Limitador para rutas de autenticación
// NOTA: En producción, considera usar Redis para compartir estado entre instancias
export const authLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 intentos por IP (más realista para usuarios legítimos)
  message: 'Demasiados intentos de autenticación, por favor intente de nuevo en 15 minutos.',
  // Permitir bypass para IPs específicas (desarrollo/testing)
  skip: (req) => {
    const ip = req.ip || '';
    // IPs locales siempre permitidas
    return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.');
  }
});

// Limitador para acciones de juego rápidas (atacar, usar items, etc)
export const gameplayLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 peticiones por minuto (1 por segundo)
  message: 'Demasiadas acciones de juego, por favor espere un momento.'
});

// Limitador para acciones de juego lentas (mazmorras, evolución, curación)
export const slowGameplayLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // 30 peticiones por ventana (permite jugar varias mazmorras)
  message: 'Demasiadas acciones de juego complejas, por favor espere un momento.'
});

// Limitador para operaciones de mercado (crear/comprar listings)
export const marketplaceLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // 50 operaciones por ventana (navegación + transacciones)
  message: 'Demasiadas operaciones de mercado, por favor espere un momento.'
});

// Limitador general para la API (capa de protección contra ataques)
export const apiLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // 300 peticiones por ventana (uso normal de la app)
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});