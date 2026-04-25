import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'
export interface AuthRequest extends Request { user?: JwtPayload }
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) { res.status(401).json({ error: 'No autorizado' }); return }
  try { req.user = verifyToken(token); next() }
  catch { res.status(401).json({ error: 'Token inválido' }) }
}
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.rol !== 'ADMIN') { res.status(403).json({ error: 'Acceso denegado' }); return }
  next()
}