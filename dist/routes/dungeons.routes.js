"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Dungeon_1 = __importDefault(require("../models/Dungeon"));
const User_1 = require("../models/User");
const dungeons_controller_1 = require("../controllers/dungeons.controller"); // 1. Importa las funciones del controlador
const auth_1 = require("../middlewares/auth"); // 2. Importa el middleware de autenticación
const router = (0, express_1.Router)();
// Helper para emitir eventos al usuario vía RealtimeService si está disponible
function emitToUser(userId, event, payload) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Realtime = require('../services/realtime.service');
        const svc = Realtime?.default || Realtime?.realtime || Realtime;
        if (svc?.emitToUser) {
            svc.emitToUser(userId.toString(), event, payload);
        }
        else if (svc?.io?.to) {
            svc.io.to(userId.toString()).emit(event, payload);
        }
    }
    catch (_) {
        // No-op si el servicio en tiempo real no está disponible durante pruebas
    }
}
// GET /api/dungeons - Obtener la lista de mazmorras (Ruta Pública)
router.get('/', async (_req, res) => {
    try {
        const dungeons = await Dungeon_1.default.find({});
        res.json(dungeons);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dungeons' });
    }
});
// GET /api/dungeons/:id - Obtener detalles de una mazmorra (Ruta Pública)
// IMPORTANTE: Debe ir ANTES de las rutas con :dungeonId para evitar conflictos
router.get('/:id', dungeons_controller_1.getDungeonDetails);
// --- 👇 RUTA NUEVA PARA INICIAR EL COMBATE (LA PELEA) 👇 ---
// POST /api/dungeons/:dungeonId/start (Ruta Protegida)
router.post('/:dungeonId/start', auth_1.auth, dungeons_controller_1.startDungeon);
// Alias: POST /api/dungeons/enter/:dungeonId → mapea a start
router.post('/enter/:dungeonId', auth_1.auth, (req, res, next) => {
    // Emitir 'dungeon:entered' solo si la respuesta es exitosa
    res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const userId = req.userId;
            const { dungeonId } = req.params;
            if (userId && dungeonId) {
                emitToUser(userId, 'dungeon:entered', { dungeonId, sessionId: 'current' });
            }
        }
    });
    return dungeons_controller_1.startDungeon(req, res, next);
});
// GET /api/dungeons/:dungeonId/progress - Obtener progreso del usuario en una mazmorra específica
router.get('/:dungeonId/progress', auth_1.auth, async (req, res) => {
    try {
        const { dungeonId } = req.params;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        const dungeon = await Dungeon_1.default.findById(dungeonId);
        if (!dungeon) {
            return res.status(404).json({ error: 'Mazmorra no encontrada.' });
        }
        // Obtener progreso de esta mazmorra
        const dungeonIdStr = dungeonId.toString();
        const progress = user.dungeon_progress?.get(dungeonIdStr);
        if (!progress) {
            // Si no tiene progreso, retornar valores iniciales
            return res.json({
                mazmorra: {
                    id: dungeon._id,
                    nombre: dungeon.nombre,
                    descripcion: dungeon.descripcion,
                    nivel_requerido_minimo: dungeon.nivel_requerido_minimo || 1
                },
                progreso: {
                    victorias: 0,
                    derrotas: 0,
                    nivel_actual: 1,
                    puntos_acumulados: 0,
                    puntos_requeridos_siguiente_nivel: 100,
                    mejor_tiempo: 0,
                    ultima_victoria: null
                },
                estadisticas_globales: {
                    racha_actual: user.dungeon_streak || 0,
                    racha_maxima: user.max_dungeon_streak || 0,
                    total_victorias: user.dungeon_stats?.total_victorias || 0,
                    total_derrotas: user.dungeon_stats?.total_derrotas || 0,
                    mejor_racha: user.dungeon_stats?.mejor_racha || 0
                }
            });
        }
        // Retornar progreso existente
        res.json({
            mazmorra: {
                id: dungeon._id,
                nombre: dungeon.nombre,
                descripcion: dungeon.descripcion,
                nivel_requerido_minimo: dungeon.nivel_requerido_minimo || 1
            },
            progreso: {
                victorias: progress.victorias,
                derrotas: progress.derrotas,
                nivel_actual: progress.nivel_actual,
                puntos_acumulados: progress.puntos_acumulados,
                puntos_requeridos_siguiente_nivel: progress.puntos_requeridos_siguiente_nivel,
                mejor_tiempo: progress.mejor_tiempo,
                ultima_victoria: progress.ultima_victoria || null
            },
            estadisticas_globales: {
                racha_actual: user.dungeon_streak || 0,
                racha_maxima: user.max_dungeon_streak || 0,
                total_victorias: user.dungeon_stats?.total_victorias || 0,
                total_derrotas: user.dungeon_stats?.total_derrotas || 0,
                mejor_racha: user.dungeon_stats?.mejor_racha || 0
            }
        });
    }
    catch (error) {
        console.error('Error al obtener progreso de mazmorra:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
// Alias: GET /api/dungeons/:dungeonId/session/:sessionId → mapea a progress (ignora sessionId)
router.get('/:dungeonId/session/:sessionId', auth_1.auth, async (req, res) => {
    // Delegar a la ruta de progreso actual. sessionId se ignora en esta versión.
    req.params = { ...req.params, dungeonId: req.params.dungeonId };
    // Reejecuta la lógica de la ruta de progreso replicando el handler anterior
    try {
        const { dungeonId } = req.params;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        const dungeon = await Dungeon_1.default.findById(dungeonId);
        if (!dungeon) {
            return res.status(404).json({ error: 'Mazmorra no encontrada.' });
        }
        const dungeonIdStr = dungeonId.toString();
        const progress = user.dungeon_progress?.get(dungeonIdStr);
        if (!progress) {
            const body = {
                mazmorra: {
                    id: dungeon._id,
                    nombre: dungeon.nombre,
                    descripcion: dungeon.descripcion,
                    nivel_requerido_minimo: dungeon.nivel_requerido_minimo || 1
                },
                progreso: {
                    victorias: 0,
                    derrotas: 0,
                    nivel_actual: 1,
                    puntos_acumulados: 0,
                    puntos_requeridos_siguiente_nivel: 100,
                    mejor_tiempo: 0,
                    ultima_victoria: null
                },
                estadisticas_globales: {
                    racha_actual: user.dungeon_streak || 0,
                    racha_maxima: user.max_dungeon_streak || 0,
                    total_victorias: user.dungeon_stats?.total_victorias || 0,
                    total_derrotas: user.dungeon_stats?.total_derrotas || 0,
                    mejor_racha: user.dungeon_stats?.mejor_racha || 0
                }
            };
            emitToUser(userId.toString(), 'dungeon:progress', { dungeonId, progreso: body.progreso });
            return res.json(body);
        }
        const body = {
            mazmorra: {
                id: dungeon._id,
                nombre: dungeon.nombre,
                descripcion: dungeon.descripcion,
                nivel_requerido_minimo: dungeon.nivel_requerido_minimo || 1
            },
            progreso: {
                victorias: progress.victorias,
                derrotas: progress.derrotas,
                nivel_actual: progress.nivel_actual,
                puntos_acumulados: progress.puntos_acumulados,
                puntos_requeridos_siguiente_nivel: progress.puntos_requeridos_siguiente_nivel,
                mejor_tiempo: progress.mejor_tiempo,
                ultima_victoria: progress.ultima_victoria || null
            },
            estadisticas_globales: {
                racha_actual: user.dungeon_streak || 0,
                racha_maxima: user.max_dungeon_streak || 0,
                total_victorias: user.dungeon_stats?.total_victorias || 0,
                total_derrotas: user.dungeon_stats?.total_derrotas || 0,
                mejor_racha: user.dungeon_stats?.mejor_racha || 0
            }
        };
        emitToUser(userId.toString(), 'dungeon:progress', { dungeonId, progreso: body.progreso });
        if (body.progreso.ultima_victoria) {
            emitToUser(userId.toString(), 'rankings:update', { reason: 'dungeon_victory', dungeonId });
        }
        return res.json(body);
    }
    catch (error) {
        console.error('Error al obtener progreso de mazmorra (alias session):', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.default = router;
