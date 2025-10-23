import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
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
  const token = header.replace(/^Bearer\s+/i, '').trim();

  if (!token) return res.status(401).json({ error: 'Falta token' });

  try {
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
