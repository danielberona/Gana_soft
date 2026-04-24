import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const usersRouter = Router();
usersRouter.use(authMiddleware);

usersRouter.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, phone: true, isActive: true, createdAt: true,
        userRoles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch { res.status(500).json({ error: 'Error listando usuarios' }); }
});

usersRouter.patch('/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.body;
    const userId = Number(req.params.id);
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.userRole.create({ data: { userId, roleId: Number(roleId) } });
    res.json({ message: 'Rol actualizado' });
  } catch { res.status(500).json({ error: 'Error actualizando rol' }); }
});
