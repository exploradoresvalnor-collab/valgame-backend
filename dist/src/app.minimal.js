"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_simple_1 = __importDefault(require("./routes/auth.routes.simple"));
const app = (0, express_1.default)();
// Middlewares básicos
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas públicas
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', auth_routes_simple_1.default);
// Ruta de prueba
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor con auth routes real funciona' });
});
// Puerto
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor con auth routes real en http://localhost:${PORT}`);
});
