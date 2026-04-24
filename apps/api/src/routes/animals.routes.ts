import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const animalsRouter = Router();
animalsRouter.use(authMiddleware);

// GET /api/animals
animalsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, search, status, sex, lotId, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;
    if (sex) where.sex = sex;
    if (lotId) where.lotId = Number(lotId);
    if (search) {
      where.OR = [
        { tagNumber: { contains: search as string } },
        { name: { contains: search as string } },
        { breed: { contains: search as string } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        include: { lot: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.animal.count({ where }),
    ]);

    res.json({ animals, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: 'Error listando animales' });
  }
});

// GET /api/animals/:id
animalsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const animal = await prisma.animal.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        lot: true,
        genealogyAsChild: { include: { dam: true, sire: true } },
        healthRecords: { orderBy: { eventDate: 'desc' }, take: 5 },
        weightRecords: { orderBy: { recordedAt: 'desc' }, take: 10 },
        reproductionRecords: { orderBy: { eventDate: 'desc' }, take: 5 },
      },
    });
    if (!animal) {
      res.status(404).json({ error: 'Animal no encontrado' });
      return;
    }
    res.json(animal);
  } catch {
    res.status(500).json({ error: 'Error obteniendo animal' });
  }
});

// POST /api/animals
animalsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, lotId, tagNumber, name, breed, sex, dateOfBirth, photoUrl, observations, damId, sireId } = req.body;

    const animal = await prisma.animal.create({
      data: {
        farmId: Number(farmId),
        lotId: lotId ? Number(lotId) : null,
        tagNumber,
        name: name || null,
        breed: breed || null,
        sex,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        photoUrl: photoUrl || null,
        observations: observations || null,
      },
    });

    if (damId || sireId) {
      await prisma.genealogy.create({
        data: {
          animalId: animal.id,
          damId: damId ? Number(damId) : null,
          sireId: sireId ? Number(sireId) : null,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        entityType: 'animal',
        entityId: animal.id,
        action: 'CREATE',
        newValues: req.body,
        animalId: animal.id,
      },
    });

    res.status(201).json(animal);
  } catch (err) {
    console.error('Create animal error:', err);
    res.status(500).json({ error: 'Error creando animal' });
  }
});

// PATCH /api/animals/:id
animalsRouter.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const old = await prisma.animal.findUnique({ where: { id } });
    if (!old) {
      res.status(404).json({ error: 'Animal no encontrado' });
      return;
    }

    const animal = await prisma.animal.update({
      where: { id },
      data: {
        ...req.body,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
        lotId: req.body.lotId !== undefined ? (req.body.lotId ? Number(req.body.lotId) : null) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        entityType: 'animal',
        entityId: id,
        action: 'UPDATE',
        oldValues: old as object,
        newValues: req.body,
        animalId: id,
      },
    });

    res.json(animal);
  } catch {
    res.status(500).json({ error: 'Error actualizando animal' });
  }
});
