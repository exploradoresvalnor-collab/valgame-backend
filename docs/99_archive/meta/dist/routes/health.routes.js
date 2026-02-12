"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
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
router.get('/', (req, res) => {
    const status = {
        ok: true,
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime() * 1000), // ms
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
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
router.get('/ready', async (req, res) => {
    try {
        // Verificar conexión a BD
        if (mongoose_1.default.connection.readyState !== 1) {
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
    }
    catch (error) {
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
router.get('/live', (req, res) => {
    res.json({
        ok: true,
        live: true,
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
