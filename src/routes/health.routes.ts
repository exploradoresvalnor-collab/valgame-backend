import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint - verifica que el servidor está disponible
 * No requiere autenticación
 * 
 * Respuesta:
 * {
 *   ok: true,
 *   timestamp: ISO 8601,
 *   uptime: ms,
 *   database: "connected" | "disconnected",
 *   version: "2.0.0"
 * }
 */
router.get('/', (req: Request, res: Response) => {
  const status = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime() * 1000), // ms
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(status);
});

/**
 * GET /api/health/ready
 * Readiness probe - verifica que todo está listo
 * Usado por Kubernetes/Docker
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Verificar conexión a BD
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        error: 'Database not ready',
        ready: false
      });
    }

    res.json({
      ok: true,
      ready: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: 'Service not ready',
      ready: false
    });
  }
});

/**
 * GET /api/health/live
 * Liveness probe - verifica que el proceso está vivo
 * Usado por Kubernetes/Docker
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    ok: true,
    live: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
