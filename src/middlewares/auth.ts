import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type JwtPayload = { id: string; username: string; };

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();

  if (!token) return res.status(401).json({ error: 'Falta token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
