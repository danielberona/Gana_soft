import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const potreroSchema = z.object({
  nombre: z.string().min(1),
  area: z.number().positive().optional(),
  capacidad: z.number().int().positive().optional(),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
})

export async function getPotreros(_req: AuthRequest, res: Response) {
  const potreros = await prisma.potrero.findMany({
    include: { _count: { select: { animales: { where: { estado: 'ACTIVO' } } } } },
    orderBy: { nombre: 'asc' },
  })
  res.json(potreros)
}

export async function getPotrero(req: AuthRequest, res: Response) {
  const potrero = await prisma.potrero.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { animales: { where: { estado: 'ACTIVO' }, select: { id: true, codigo: true, nombre: true, especie: true, sexo: true, peso: true } } },
  })
  if (!potrero) { res.status(404).json({ error: 'Potrero no encontrado' }); return }
  res.json(potrero)
}

export async function createPotrero(req: AuthRequest, res: Response) {
  const data = potreroSchema.parse(req.body)
  const potrero = await prisma.potrero.create({ data: data as { nombre: string; area?: number; capacidad?: number; descripcion?: string; activo?: boolean } })
  res.status(201).json(potrero)
}

export async function updatePotrero(req: AuthRequest, res: Response) {
  const data = potreroSchema.partial().parse(req.body)
  const potrero = await prisma.potrero.update({ where: { id: parseInt(req.params.id) }, data })
  res.json(potrero)
}

export async function deletePotrero(req: AuthRequest, res: Response) {
  await prisma.potrero.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Potrero eliminado' })
}
