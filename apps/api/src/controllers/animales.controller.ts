import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { Especie, Sexo, EstadoAnimal } from '@prisma/client'

const animalSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().optional(),
  especie: z.nativeEnum(Especie),
  raza: z.string().optional(),
  sexo: z.nativeEnum(Sexo),
  fechaNac: z.string().optional().transform(v => v ? new Date(v) : undefined),
  peso: z.number().positive().optional(),
  estado: z.nativeEnum(EstadoAnimal).optional(),
  observaciones: z.string().optional(),
})

export async function getAnimales(req: AuthRequest, res: Response) {
  const { especie, estado, search, page = '1', limit = '20' } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (especie) where.especie = especie
  if (estado) where.estado = estado
  if (search) where.OR = [{ codigo: { contains: search } }, { nombre: { contains: search } }, { raza: { contains: search } }]
  const pageNum = parseInt(page), limitNum = parseInt(limit)
  const [animales, total] = await Promise.all([
    prisma.animal.findMany({ where, include: { usuario: { select: { nombre: true } } }, orderBy: { creadoEn: 'desc' }, skip: (pageNum - 1) * limitNum, take: limitNum }),
    prisma.animal.count({ where }),
  ])
  res.json({ animales, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
}

export async function getAnimal(req: AuthRequest, res: Response) {
  const animal = await prisma.animal.findUnique({ where: { id: parseInt(req.params.id) }, include: { registros: { orderBy: { fecha: 'desc' }, take: 10 }, producciones: { orderBy: { fecha: 'desc' }, take: 10 } } })
  if (!animal) { res.status(404).json({ error: 'Animal no encontrado' }); return }
  res.json(animal)
}

export async function createAnimal(req: AuthRequest, res: Response) {
  const data = animalSchema.parse(req.body)
  const animal = await prisma.animal.create({ data: { ...data, usuarioId: req.user!.userId } })
  res.status(201).json(animal)
}

export async function updateAnimal(req: AuthRequest, res: Response) {
  const data = animalSchema.partial().parse(req.body)
  const animal = await prisma.animal.update({ where: { id: parseInt(req.params.id) }, data })
  res.json(animal)
}

export async function deleteAnimal(req: AuthRequest, res: Response) {
  await prisma.animal.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Animal eliminado' })
}

export async function getEstadisticas(_req: AuthRequest, res: Response) {
  const [totalAnimales, porEspecie, porEstado, pesoPromedio] = await Promise.all([
    prisma.animal.count(),
    prisma.animal.groupBy({ by: ['especie'], _count: true }),
    prisma.animal.groupBy({ by: ['estado'], _count: true }),
    prisma.animal.aggregate({ _avg: { peso: true } }),
  ])
  res.json({ totalAnimales, porEspecie, porEstado, pesoPromedio: pesoPromedio._avg.peso })
}