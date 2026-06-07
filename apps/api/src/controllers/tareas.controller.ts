import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { EstadoTarea, Prioridad } from '@prisma/client'

const tareaSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  fecha: z.string().transform(v => new Date(v)),
  estado: z.nativeEnum(EstadoTarea).optional(),
  prioridad: z.nativeEnum(Prioridad).optional(),
  animalId: z.number().int().positive().optional(),
  usuarioId: z.number().int().positive().optional(),
})

export async function getTareas(req: AuthRequest, res: Response) {
  const { estado, prioridad, page = '1', limit = '20' } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (estado) where.estado = estado
  if (prioridad) where.prioridad = prioridad
  const pageNum = parseInt(page), limitNum = parseInt(limit)
  const [tareas, total] = await Promise.all([
    prisma.tarea.findMany({
      where,
      include: {
        animal: { select: { codigo: true, nombre: true, especie: true } },
        usuario: { select: { nombre: true } },
      },
      orderBy: [{ prioridad: 'asc' }, { fecha: 'asc' }],
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.tarea.count({ where }),
  ])
  res.json({ tareas, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
}

export async function getTareasPendientes(req: AuthRequest, res: Response) {
  const tareas = await prisma.tarea.findMany({
    where: { estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } },
    include: { animal: { select: { codigo: true, nombre: true, especie: true } } },
    orderBy: [{ prioridad: 'asc' }, { fecha: 'asc' }],
    take: 20,
  })
  res.json(tareas)
}

export async function createTarea(req: AuthRequest, res: Response) {
  const data = tareaSchema.parse(req.body)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tarea = await prisma.tarea.create({ data: data as any, include: { animal: { select: { codigo: true, nombre: true } } } })
  res.status(201).json(tarea)
}

export async function updateTarea(req: AuthRequest, res: Response) {
  const data = tareaSchema.partial().parse(req.body)
  const tarea = await prisma.tarea.update({ where: { id: parseInt(req.params.id) }, data })
  res.json(tarea)
}

export async function deleteTarea(req: AuthRequest, res: Response) {
  await prisma.tarea.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Tarea eliminada' })
}
