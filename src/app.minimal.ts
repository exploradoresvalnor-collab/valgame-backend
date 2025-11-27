import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.simple';

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Rutas públicas
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor con auth routes real funciona' });
});

// Puerto
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor con auth routes real en http://localhost:${PORT}`);
});