import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { auth as checkAuth } from './middlewares/auth';

// Importa todas tus rutas
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import baseCharactersRoutes from './routes/baseCharacters.routes';
import categoriesRoutes from './routes/categories.routes';
import itemsRoutes from './routes/items.routes';
import packagesRoutes from './routes/packages.routes';
import userPackagesRoutes from './routes/userPackages.routes';
import gameSettingsRoutes from './routes/gameSettings.routes';
import levelRequirementsRoutes from './routes/levelRequirements.routes';
import eventsRoutes from './routes/events.routes';
import playerStatsRoutes from './routes/playerStats.routes';
import offerRoutes from './routes/offers.routes';
import equipmentRoutes from './routes/equipment.routes';
import consumableRoutes from './routes/consumables.routes';
import dungeonRoutes from './routes/dungeons.routes';

// Valida variables de entorno críticas al inicio
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('[FATAL] Faltan variables de entorno críticas (MONGODB_URI o JWT_SECRET).');
  process.exit(1);
}

const app = express();

// --- Middlewares de Seguridad Esenciales ---
app.use(helmet()); // Añade cabeceras de seguridad
app.use(express.json()); // Permite al servidor entender JSON

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN,
};
if (!process.env.FRONTEND_ORIGIN) {
    console.warn('[CORS] La variable FRONTEND_ORIGIN no está definida. Se permitirán todas las peticiones.');
    // En desarrollo, puedes permitir todo si no se define. En producción, siempre defínelo.
    app.use(cors());
} else {
    app.use(cors(corsOptions));
}


const apiLimiter = rateLimit({
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
app.use('/auth', authRoutes);
app.use('/api/packages', packagesRoutes); // Cualquiera puede ver los paquetes de la tienda
app.use('/api/base-characters', baseCharactersRoutes); // Cualquiera puede ver los personajes que existen
app.use('/api/offers', offerRoutes); // Cualquiera puede ver las ofertas activas
app.use('/api/game-settings', gameSettingsRoutes); // El juego necesita las reglas para funcionar
app.use('/api/equipment', equipmentRoutes);
app.use('/api/consumables', consumableRoutes);
app.use('/api/dungeons', dungeonRoutes);


// --- Rutas Protegidas (Requieren autenticación con token) ---
app.use(checkAuth); // A partir de aquí, todas las rutas usarán el "guardia de seguridad"

app.use('/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/user-packages', userPackagesRoutes);
app.use('/api/level-requirements', levelRequirementsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/player-stats', playerStatsRoutes);


// --- Arranque del Servidor ---
const PORT = Number(process.env.PORT || 8080);
const MONGODB_URI = process.env.MONGODB_URI;

connectDB(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Error de conexión:', err);
    process.exit(1);
  });

export default app;