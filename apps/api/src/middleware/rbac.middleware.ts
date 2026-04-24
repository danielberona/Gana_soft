import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { prisma } from '../lib/prisma.js';

export const rbacMiddleware = (module: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }

      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.userId },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      const hasPermission = userRoles.some((ur) =>
        ur.role.permissions.some(
          (rp) => rp.permission.module === module && rp.permission.action === action
        )
      );

      if (!hasPermission) {
        res.status(403).json({ error: 'Sin permisos para esta acción' });
        return;
      }

      next();
    } catch {
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};
