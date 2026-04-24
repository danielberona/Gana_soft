import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const reproductionRouter = Router();
reproductionRouter.use(authMiddleware);

reproductionRouter.get('/:animalId', async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.reproductionRecord.findMany({
      where: { animalId: Number(req.params.animalId) },
      include: { calf: true, createdBy: { select: { fullName: true } } },
      orderBy: { eventDate: 'desc' },
    });
    res.json(records);
  } catch { res.status(500).json({ error: 'Error listando registros reproductivos' }); }
});

reproductionRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { animalId, type, eventDate, pregnancyStatus, expectedDueDate, actualCalvingDate, calfId, notes } = req.body;
    const record = await prisma.reproductionRecord.create({
      data: {
        animalId: Number(animalId), type, eventDate: new Date(eventDate),
        pregnancyStatus: pregnancyStatus || 'PENDING',
        expectedDueDate: expectedDueDate ? new Date(expectedDueDate) : null,
        actualCalvingDate: actualCalvingDate ? new Date(actualCalvingDate) : null,
        calfId: calfId ? Number(calfId) : null, notes, createdById: req.userId!,
      },
    });
    res.status(201).json(record);
  } catch { res.status(500).json({ error: 'Error creando registro reproductivo' }); }
});
