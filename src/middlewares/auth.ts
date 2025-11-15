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
  const header = req.header('Authorization') || '';
  let token = header.replace(/^Bearer\s+/i, '').trim();

  // 🔐 SEGURIDAD: Intentar obtener token de httpOnly cookie si no está en header
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ error: 'Falta token' });

  try {
    // Verificar si el token está en la blacklist
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ error: 'Token inválido o sesión cerrada' });
    }

    const decoded = jwt.verify(token, getJWTSecret()) as JwtPayload;
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
