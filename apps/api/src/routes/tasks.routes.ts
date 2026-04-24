import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const tasksRouter = Router();
tasksRouter.use(authMiddleware);

tasksRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, status, assignedTo, from, to } = req.query;
    const where: Record<string, unknown> = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;
    if (assignedTo) where.assignedToId = Number(assignedTo);
    if (from || to) {
      where.dueDate = {};
      if (from) (where.dueDate as Record<string, unknown>).gte = new Date(from as string);
      if (to) (where.dueDate as Record<string, unknown>).lte = new Date(to as string);
    }
    const tasks = await prisma.task.findMany({
      where, include: {
        assignedTo: { select: { fullName: true } },
        animal: { select: { tagNumber: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(tasks);
  } catch { res.status(500).json({ error: 'Error listando tareas' }); }
});

tasksRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body, farmId: Number(req.body.farmId),
        assignedToId: req.body.assignedToId ? Number(req.body.assignedToId) : null,
        animalId: req.body.animalId ? Number(req.body.animalId) : null,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        startTime: req.body.startTime ? new Date(req.body.startTime) : null,
        endTime: req.body.endTime ? new Date(req.body.endTime) : null,
        createdById: req.userId!,
      },
    });
    res.status(201).json(task);
  } catch { res.status(500).json({ error: 'Error creando tarea' }); }
});

tasksRouter.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });
    res.json(task);
  } catch { res.status(500).json({ error: 'Error actualizando tarea' }); }
});
