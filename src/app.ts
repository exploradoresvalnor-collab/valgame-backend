import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { validateSecurityConfig } from './config/security'; // Importar validación de seguridad
import { auth as checkAuth } from './middlewares/auth';
import { startPermadeathCron } from './services/permadeath.service';
import { startMarketplaceExpirationCron } from './services/marketplace-expiration.service';
import errorHandler from './middlewares/errorHandler';

// Importa todas tus rutas
import authRoutes from './routes/auth.routes';
import paymentsRoutes from './routes/payments.routes';
import paymentService from './services/payment.service';
import usersRoutes from './routes/users.routes';
import userSettingsRoutes from './routes/userSettings.routes';
import notificationsRoutes from './routes/notifications.routes';
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
import marketplaceRoutes from './routes/marketplace.routes';
import marketplaceTransactionsRoutes from './routes/marketplaceTransactions.routes';
import equipmentRoutes from './routes/equipment.routes';
import consumableRoutes from './routes/consumables.routes';
import dungeonRoutes from './routes/dungeons.routes';
import characterRoutes from './routes/characters.routes';

// Valida variables de entorno críticas al inicio (salta en tests)
if (process.env.NODE_ENV !== 'test') {
  try {
    validateSecurityConfig();
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

const app = express();

// --- Middlewares de Seguridad Esenciales ---
app.use(helmet()); // Añade cabeceras de seguridad
// Nota: el endpoint de webhook necesita el raw body para validar la firma HMAC.
// Montamos la ruta específica antes de `express.json()` con raw, y luego usamos json para el resto.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => paymentService.handleWebhook(req as any, res as any));

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


// Importar rate limiters
import { 
  authLimiter, 
  gameplayLimiter, 
  slowGameplayLimiter,
  marketplaceLimiter, 
  apiLimiter 
} from './middlewares/rateLimits';

// Aplica los rate limiters según el tipo de ruta
app.use('/auth/', authLimiter);

// Rate limits para acciones de juego rápidas
app.use('/api/characters/action', gameplayLimiter);
app.use('/api/characters/attack', gameplayLimiter);
app.use('/api/characters/defend', gameplayLimiter);

// Rate limits para acciones de juego lentas
app.use('/api/dungeons', slowGameplayLimiter);
app.use('/api/characters/evolve', slowGameplayLimiter);

// Rate limits para el mercado
app.use('/api/offers', marketplaceLimiter);

// Rate limit general para otras rutas de la API
app.use('/api/', apiLimiter);


// --- Rutas Públicas (No requieren autenticación) ---
app.get('/health', (_req, res) => res.json({ ok: true })); // Ruta para chequear si el servidor está vivo
app.use('/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/packages', packagesRoutes); // Cualquiera puede ver los paquetes de la tienda
app.use('/api/base-characters', baseCharactersRoutes); // Cualquiera puede ver los personajes que existen
app.use('/api/offers', offerRoutes); // Cualquiera puede ver las ofertas activas
app.use('/api/game-settings', gameSettingsRoutes); // El juego necesita las reglas para funcionar
app.use('/api/equipment', equipmentRoutes);
app.use('/api/consumables', consumableRoutes);
app.use('/api/dungeons', dungeonRoutes);


// --- Rutas Protegidas (Requieren autenticación con token) ---
app.use(checkAuth); // A partir de aquí, todas las rutas usarán el "guardia de seguridad"

// Aplicar rate limiter específico DESPUÉS de la autenticación
app.use('/api/marketplace', marketplaceLimiter);

app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/marketplace-transactions', marketplaceTransactionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/user/settings', userSettingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/user-packages', userPackagesRoutes);
app.use('/api/level-requirements', levelRequirementsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/player-stats', playerStatsRoutes);
app.use('/api/characters', characterRoutes);


// --- Arranque del Servidor ---
const PORT = Number(process.env.PORT || 8080);
const MONGODB_URI = process.env.MONGODB_URI;

// En entorno de pruebas, no arrancamos la conexión automática ni el servidor.
if (process.env.NODE_ENV !== 'test') {
  if (!MONGODB_URI) {
    console.error('[FATAL] MONGODB_URI no está definido.');
    process.exit(1);
  }

  connectDB(MONGODB_URI)
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
        startPermadeathCron(); // Inicia la tarea programada de Permadeath
        startMarketplaceExpirationCron(); // Inicia la expiración automática del marketplace
        
        // Inicializar el servicio de tiempo real
        const RealtimeService = require('./services/realtime.service').RealtimeService;
        RealtimeService.initialize(server);
        console.log('[REALTIME] Servicio WebSocket inicializado');
      });

      // Graceful shutdown
      const shutdown = async (signal: string) => {
        console.log(`[SHUTDOWN] Recibida señal ${signal}. Cerrando servidor...`);
        server.close(async () => {
          try {
            await mongoose.disconnect();
            console.log('[SHUTDOWN] Conexión a MongoDB cerrada.');
            process.exit(0);
          } catch (err) {
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
} else {
  console.log('[API] Modo test: no se inicia conexión automática a MongoDB ni servidor HTTP.');
}

// Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;