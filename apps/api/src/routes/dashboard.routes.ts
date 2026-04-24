import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const dashboardRouter = Router();
dashboardRouter.use(authMiddleware);

dashboardRouter.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const farmId = Number(req.query.farmId);
    if (!farmId) { res.status(400).json({ error: 'farmId requerido' }); return; }

    const [totalAnimals, pregnant, inTreatment, pendingTasks, upcomingBirths] = await Promise.all([
      prisma.animal.count({ where: { farmId, status: 'ACTIVE' } }),
      prisma.reproductionRecord.count({
        where: { animal: { farmId }, pregnancyStatus: 'CONFIRMED' },
      }),
      prisma.healthRecord.count({
        where: { animal: { farmId }, eventDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.task.count({ where: { farmId, status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.reproductionRecord.findMany({
        where: {
          animal: { farmId }, pregnancyStatus: 'CONFIRMED',
          expectedDueDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        },
        include: { animal: { select: { tagNumber: true, name: true } } },
        orderBy: { expectedDueDate: 'asc' },
        take: 5,
      }),
    ]);

    res.json({ totalAnimals, pregnant, inTreatment, pendingTasks, upcomingBirths });
  } catch { res.status(500).json({ error: 'Error obteniendo estadísticas' }); }
});
