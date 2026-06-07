import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { TipoEvento } from '@prisma/client'

const eventoSchema = z.object({
  animalId: z.number().int().positive(),
  tipo: z.nativeEnum(TipoEvento),
  fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()),
  descripcion: z.string().optional(),
  resultado: z.string().optional(),
  padreId: z.number().int().positive().optional(),
})

export async function getEventos(req: AuthRequest, res: Response) {
  const { animalId, tipo, page = '1', limit = '20' } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  if (tipo) where.tipo = tipo
  const pageNum = parseInt(page), limitNum = parseInt(limit)
  const [eventos, total] = await Promise.all([
    prisma.eventoReproductivo.findMany({
      where,
      include: { animal: { select: { codigo: true, nombre: true, especie: true, sexo: true } } },
      orderBy: { fecha: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.eventoReproductivo.count({ where }),
  ])
  res.json({ eventos, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
}

export async function createEvento(req: AuthRequest, res: Response) {
  const data = eventoSchema.parse(req.body)
  const evento = await prisma.eventoReproductivo.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data as any,
    include: { animal: { select: { codigo: true, nombre: true } } },
  })
  if (data.tipo === 'PARTO') {
    await prisma.animal.update({ where: { id: data.animalId }, data: { estado: 'ACTIVO' } })
  }
  res.status(201).json(evento)
}

export async function updateEvento(req: AuthRequest, res: Response) {
  const data = eventoSchema.partial().parse(req.body)
  const evento = await prisma.eventoReproductivo.update({ where: { id: parseInt(req.params.id) }, data })
  res.json(evento)
}

export async function deleteEvento(req: AuthRequest, res: Response) {
  await prisma.eventoReproductivo.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Evento eliminado' })
}
