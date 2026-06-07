import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const vacunacionSchema = z.object({
  animalId: z.number().int().positive(),
  vacuna: z.string().min(1),
  dosis: z.string().optional(),
  lote: z.string().optional(),
  fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()),
  proximaFecha: z.string().optional().transform(v => v ? new Date(v) : undefined),
  veterinario: z.string().optional(),
  costo: z.number().optional(),
})

export async function getVacunaciones(req: AuthRequest, res: Response) {
  const { animalId, desde, hasta, page = '1', limit = '20' } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  if (desde || hasta) where.fecha = { ...(desde ? { gte: new Date(desde) } : {}), ...(hasta ? { lte: new Date(hasta) } : {}) }
  const pageNum = parseInt(page), limitNum = parseInt(limit)
  const [vacunaciones, total] = await Promise.all([
    prisma.vacunacion.findMany({
      where,
      include: { animal: { select: { codigo: true, nombre: true, especie: true } } },
      orderBy: { fecha: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.vacunacion.count({ where }),
  ])
  res.json({ vacunaciones, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
}

export async function getProximasVacunas(req: AuthRequest, res: Response) {
  const dias = parseInt((req.query.dias as string) || '30')
  const hasta = new Date()
  hasta.setDate(hasta.getDate() + dias)
  const proximas = await prisma.vacunacion.findMany({
    where: { proximaFecha: { lte: hasta, gte: new Date() } },
    include: { animal: { select: { id: true, codigo: true, nombre: true, especie: true } } },
    orderBy: { proximaFecha: 'asc' },
    take: 50,
  })
  res.json(proximas)
}

export async function createVacunacion(req: AuthRequest, res: Response) {
  const data = vacunacionSchema.parse(req.body)
  const vacunacion = await prisma.vacunacion.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data as any,
    include: { animal: { select: { codigo: true, nombre: true } } },
  })
  res.status(201).json(vacunacion)
}

export async function updateVacunacion(req: AuthRequest, res: Response) {
  const data = vacunacionSchema.partial().parse(req.body)
  const vacunacion = await prisma.vacunacion.update({ where: { id: parseInt(req.params.id) }, data })
  res.json(vacunacion)
}

export async function deleteVacunacion(req: AuthRequest, res: Response) {
  await prisma.vacunacion.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Vacunación eliminada' })
}
