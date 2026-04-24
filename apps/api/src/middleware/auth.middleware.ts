import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as { userId: number; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
