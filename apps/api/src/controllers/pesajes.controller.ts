import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const pesajeSchema = z.object({
  animalId: z.number().int().positive(),
  peso: z.number().positive(),
  fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()),
  observaciones: z.string().optional(),
})

export async function getPesajes(req: AuthRequest, res: Response) {
  const { animalId } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  const pesajes = await prisma.pesajeHistorial.findMany({
    where,
    include: { animal: { select: { codigo: true, nombre: true } } },
    orderBy: { fecha: 'desc' },
    take: 100,
  })
  res.json(pesajes)
}

export async function createPesaje(req: AuthRequest, res: Response) {
  const data = pesajeSchema.parse(req.body)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pesaje = await prisma.pesajeHistorial.create({ data: data as any })
  await prisma.animal.update({ where: { id: data.animalId }, data: { peso: data.peso } })
  res.status(201).json(pesaje)
}

export async function deletePesaje(req: AuthRequest, res: Response) {
  await prisma.pesajeHistorial.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Pesaje eliminado' })
}
