import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { getJWTSecret } from '../config/security';

type JwtPayload = { id: string; username: string; };

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

export async function auth(req: Request, res: Response, next: NextFunction) {
  // 🔓 RUTAS PÚBLICAS (No requieren autenticación)
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/verify',
    '/auth/resend-verification',
    '/auth/forgot-password',
    '/auth/reset-form',
    '/auth/reset-password',
    '/api/health',
    '/api/packages',
    '/api/base-characters',
    '/api/offers',
    '/api/game-settings',
    '/api/equipment',
    '/api/consumables',
    '/api/dungeons'
  ];

  // Verificar si la ruta actual es pública
  const currentPath = req.path;
  const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));

  if (isPublicRoute) {
    return next(); // Saltar autenticación para rutas públicas
  }

  const header = req.header('Authorization') || '';
  let token = header.replace(/^Bearer\s+/i, '').trim();

  // 🔐 SEGURIDAD: Intentar obtener token de httpOnly cookie si no está en header
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ error: 'Falta token' });

  try {
    const decoded = jwt.verify(token, getJWTSecret()) as JwtPayload;

    // En modo desarrollo, no buscar usuario en BD ni verificar blacklist
    if (process.env.NODE_ENV !== 'production') {
      (req as any).user = { _id: decoded.id, id: decoded.id };
      (req as any).userId = decoded.id;
      next();
      return;
    }

    // Verificar si el token está en la blacklist
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ error: 'Token inválido o sesión cerrada' });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Compatibilidad: algunos controladores esperan `req.userId`, otros `req.user`
    (req as any).user = user;
    (req as any).userId = (user._id as any).toString();
    next();
  } catch (error) {
    console.error('Error en el middleware de autenticación:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
}
