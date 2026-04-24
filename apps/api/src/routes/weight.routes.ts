import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const weightRouter = Router();
weightRouter.use(authMiddleware);

weightRouter.get('/:animalId', async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.weightRecord.findMany({
      where: { animalId: Number(req.params.animalId) },
      orderBy: { recordedAt: 'desc' },
    });
    res.json(records);
  } catch { res.status(500).json({ error: 'Error listando registros de peso' }); }
});

weightRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { animalId, weightKg, recordedAt } = req.body;
    const lastRecord = await prisma.weightRecord.findFirst({
      where: { animalId: Number(animalId) }, orderBy: { recordedAt: 'desc' },
    });
    const gainKg = lastRecord ? Number(weightKg) - lastRecord.weightKg : null;
    const record = await prisma.weightRecord.create({
      data: {
        animalId: Number(animalId), weightKg: Number(weightKg),
        recordedAt: new Date(recordedAt), gainKg, recordedById: req.userId!,
      },
    });
    res.status(201).json(record);
  } catch { res.status(500).json({ error: 'Error creando registro de peso' }); }
});
