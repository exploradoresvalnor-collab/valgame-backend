"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); // 🔐 Para cookies httpOnly
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("./config/db");
const security_1 = require("./config/security"); // Importar validación de seguridad
const auth_1 = require("./middlewares/auth");
const permadeath_service_1 = require("./services/permadeath.service");
const marketplace_expiration_service_1 = require("./services/marketplace-expiration.service");
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
// Importa todas tus rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const payment_service_1 = __importDefault(require("./services/payment.service"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const userSettings_routes_1 = __importDefault(require("./routes/userSettings.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const baseCharacters_routes_1 = __importDefault(require("./routes/baseCharacters.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
const items_routes_1 = __importDefault(require("./routes/items.routes"));
const packages_routes_1 = __importDefault(require("./routes/packages.routes"));
const userPackages_routes_1 = __importDefault(require("./routes/userPackages.routes"));
const gameSettings_routes_1 = __importDefault(require("./routes/gameSettings.routes"));
const levelRequirements_routes_1 = __importDefault(require("./routes/levelRequirements.routes"));
const events_routes_1 = __importDefault(require("./routes/events.routes"));
const playerStats_routes_1 = __importDefault(require("./routes/playerStats.routes"));
const offers_routes_1 = __importDefault(require("./routes/offers.routes"));
const marketplace_routes_1 = __importDefault(require("./routes/marketplace.routes"));
const marketplaceTransactions_routes_1 = __importDefault(require("./routes/marketplaceTransactions.routes"));
const equipment_routes_1 = __importDefault(require("./routes/equipment.routes"));
const consumables_routes_1 = __importDefault(require("./routes/consumables.routes"));
const dungeons_routes_1 = __importDefault(require("./routes/dungeons.routes"));
const characters_routes_1 = __importDefault(require("./routes/characters.routes"));
const shop_routes_1 = __importDefault(require("./routes/shop.routes"));
const rankings_routes_1 = __importDefault(require("./routes/rankings.routes"));
// Valida variables de entorno críticas al inicio (salta en tests)
if (process.env.NODE_ENV !== 'test') {
    try {
        (0, security_1.validateSecurityConfig)();
    }
    catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
const app = (0, express_1.default)();
// --- Middlewares de Seguridad Esenciales ---
app.use((0, helmet_1.default)()); // Añade cabeceras de seguridad
// Nota: el endpoint de webhook necesita el raw body para validar la firma HMAC.
// Montamos la ruta específica antes de `express.json()` con raw, y luego usamos json para el resto.
app.post('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }), (req, res) => payment_service_1.default.handleWebhook(req, res));
app.use((0, cookie_parser_1.default)()); // 🔐 Middleware para cookies httpOnly
app.use(express_1.default.json()); // Permite al servidor entender JSON
// ⚠️ MODO DESARROLLO: Permitir solicitudes de TODOS los dominios
// TODO: Restaurar validación por dominios antes de producción final
console.warn('[CORS] ⚠️ MODO DESARROLLO: Aceptando solicitudes de todos los orígenes');
app.use((0, cors_1.default)({
    origin: true, // Permite cualquier origen
    credentials: true
}));
// Importar rate limiters
const rateLimits_1 = require("./middlewares/rateLimits");
// Aplica los rate limiters según el tipo de ruta
app.use('/auth/', rateLimits_1.authLimiter);
// Rate limits para acciones de juego rápidas
app.use('/api/characters/action', rateLimits_1.gameplayLimiter);
app.use('/api/characters/attack', rateLimits_1.gameplayLimiter);
app.use('/api/characters/defend', rateLimits_1.gameplayLimiter);
// Rate limits para acciones de juego lentas
app.use('/api/dungeons', rateLimits_1.slowGameplayLimiter);
app.use('/api/characters/evolve', rateLimits_1.slowGameplayLimiter);
// Rate limits para el mercado
app.use('/api/offers', rateLimits_1.marketplaceLimiter);
// Rate limit general para otras rutas de la API
app.use('/api/', rateLimits_1.apiLimiter);
// --- Rutas Públicas (No requieren autenticación) ---
app.get('/health', (_req, res) => res.json({ ok: true })); // Ruta para chequear si el servidor está vivo
app.use('/auth', auth_routes_1.default);
app.use('/api/payments', payments_routes_1.default);
app.use('/api/packages', packages_routes_1.default); // Cualquiera puede ver los paquetes de la tienda
app.use('/api/base-characters', baseCharacters_routes_1.default); // Cualquiera puede ver los personajes que existen
app.use('/api/offers', offers_routes_1.default); // Cualquiera puede ver las ofertas activas
app.use('/api/game-settings', gameSettings_routes_1.default); // El juego necesita las reglas para funcionar
app.use('/api/equipment', equipment_routes_1.default);
app.use('/api/consumables', consumables_routes_1.default);
app.use('/api/dungeons', dungeons_routes_1.default);
// --- Rutas Protegidas (Requieren autenticación con token) ---
app.use(auth_1.auth); // A partir de aquí, todas las rutas usarán el "guardia de seguridad"
// Aplicar rate limiter específico DESPUÉS de la autenticación
app.use('/api/marketplace', rateLimits_1.marketplaceLimiter);
app.use('/api/marketplace', marketplace_routes_1.default);
app.use('/api/marketplace-transactions', marketplaceTransactions_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/user/settings', userSettings_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/items', items_routes_1.default);
app.use('/api/user-packages', userPackages_routes_1.default);
app.use('/api/level-requirements', levelRequirements_routes_1.default);
app.use('/api/events', events_routes_1.default);
app.use('/api/player-stats', playerStats_routes_1.default);
app.use('/api/characters', characters_routes_1.default);
app.use('/api/shop', shop_routes_1.default);
app.use('/api/rankings', rankings_routes_1.default);
// --- Arranque del Servidor ---
const PORT = Number(process.env.PORT || 8080);
const MONGODB_URI = process.env.MONGODB_URI;
// En entorno de pruebas, no arrancamos la conexión automática ni el servidor.
if (process.env.NODE_ENV !== 'test') {
    if (!MONGODB_URI) {
        console.error('[FATAL] MONGODB_URI no está definido.');
        process.exit(1);
    }
    (0, db_1.connectDB)(MONGODB_URI)
        .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
            (0, permadeath_service_1.startPermadeathCron)(); // Inicia la tarea programada de Permadeath
            (0, marketplace_expiration_service_1.startMarketplaceExpirationCron)(); // Inicia la expiración automática del marketplace
            // Inicializar el servicio de tiempo real
            const RealtimeService = require('./services/realtime.service').RealtimeService;
            RealtimeService.initialize(server);
            console.log('[REALTIME] Servicio WebSocket inicializado');
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            console.log(`[SHUTDOWN] Recibida señal ${signal}. Cerrando servidor...`);
            server.close(async () => {
                try {
                    await mongoose_1.default.disconnect();
                    console.log('[SHUTDOWN] Conexión a MongoDB cerrada.');
                    process.exit(0);
                }
                catch (err) {
                    console.error('[SHUTDOWN] Error al desconectar:', err);
                    process.exit(1);
                }
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('unhandledRejection', (reason) => {
            console.error('[UNHANDLED_REJECTION]', reason);
        });
        process.on('uncaughtException', (err) => {
            console.error('[UNCAUGHT_EXCEPTION]', err);
            shutdown('uncaughtException');
        });
    })
        .catch((err) => {
        console.error('[DB] Error de conexión:', err);
        process.exit(1);
    });
}
else {
    console.log('[API] Modo test: no se inicia conexión automática a MongoDB ni servidor HTTP.');
}
// Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler_1.default);
exports.default = app;
