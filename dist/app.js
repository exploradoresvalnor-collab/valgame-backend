"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("./config/db");
const auth_1 = require("./middlewares/auth");
// Importa todas tus rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
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
const equipment_routes_1 = __importDefault(require("./routes/equipment.routes"));
const consumables_routes_1 = __importDefault(require("./routes/consumables.routes"));
const dungeons_routes_1 = __importDefault(require("./routes/dungeons.routes"));
// Valida variables de entorno críticas al inicio
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error('[FATAL] Faltan variables de entorno críticas (MONGODB_URI o JWT_SECRET).');
    process.exit(1);
}
const app = (0, express_1.default)();
// --- Middlewares de Seguridad Esenciales ---
app.use((0, helmet_1.default)()); // Añade cabeceras de seguridad
app.use(express_1.default.json()); // Permite al servidor entender JSON
const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
};
if (!process.env.FRONTEND_ORIGIN) {
    console.warn('[CORS] La variable FRONTEND_ORIGIN no está definida. Se permitirán todas las peticiones.');
    // En desarrollo, puedes permitir todo si no se define. En producción, siempre defínelo.
    app.use((0, cors_1.default)());
}
else {
    app.use((0, cors_1.default)(corsOptions));
}
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});
// Aplica el rate limiter a las rutas más importantes
app.use('/auth/', apiLimiter);
app.use('/api/', apiLimiter);
// --- Rutas Públicas (No requieren autenticación) ---
app.get('/health', (_req, res) => res.json({ ok: true })); // Ruta para chequear si el servidor está vivo
app.use('/auth', auth_routes_1.default);
app.use('/api/packages', packages_routes_1.default); // Cualquiera puede ver los paquetes de la tienda
app.use('/api/base-characters', baseCharacters_routes_1.default); // Cualquiera puede ver los personajes que existen
app.use('/api/offers', offers_routes_1.default); // Cualquiera puede ver las ofertas activas
app.use('/api/game-settings', gameSettings_routes_1.default); // El juego necesita las reglas para funcionar
app.use('/api/equipment', equipment_routes_1.default);
app.use('/api/consumables', consumables_routes_1.default);
app.use('/api/dungeons', dungeons_routes_1.default);
// --- Rutas Protegidas (Requieren autenticación con token) ---
app.use(auth_1.auth); // A partir de aquí, todas las rutas usarán el "guardia de seguridad"
app.use('/users', users_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/items', items_routes_1.default);
app.use('/api/user-packages', userPackages_routes_1.default);
app.use('/api/level-requirements', levelRequirements_routes_1.default);
app.use('/api/events', events_routes_1.default);
app.use('/api/player-stats', playerStats_routes_1.default);
// --- Arranque del Servidor ---
const PORT = Number(process.env.PORT || 8080);
const MONGODB_URI = process.env.MONGODB_URI;
(0, db_1.connectDB)(MONGODB_URI)
    .then(() => {
    app.listen(PORT, () => {
        console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('[DB] Error de conexión:', err);
    process.exit(1);
});
exports.default = app;
