import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const healthRouter = Router();
healthRouter.use(authMiddleware);

healthRouter.get('/:animalId', async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.healthRecord.findMany({
      where: { animalId: Number(req.params.animalId) },
      include: { medication: true, createdBy: { select: { fullName: true } } },
      orderBy: { eventDate: 'desc' },
    });
    res.json(records);
  } catch { res.status(500).json({ error: 'Error listando registros sanitarios' }); }
});

healthRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { animalId, medicationId, type, eventDate, diagnosis, dosage, veterinarianNotes } = req.body;
    const record = await prisma.healthRecord.create({
      data: {
        animalId: Number(animalId), medicationId: medicationId ? Number(medicationId) : null,
        type, eventDate: new Date(eventDate), diagnosis, dosage, veterinarianNotes, createdById: req.userId!,
      },
    });
    res.status(201).json(record);
  } catch { res.status(500).json({ error: 'Error creando registro sanitario' }); }
});
