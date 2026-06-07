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
  color: z.string().optional(),
  numeroArete: z.string().optional(),
  fechaNac: z.string().optional().transform(v => v ? new Date(v) : undefined),
  peso: z.number().positive().optional(),
  estado: z.nativeEnum(EstadoAnimal).optional(),
  observaciones: z.string().optional(),
  potreroId: z.number().int().positive().optional().nullable(),
  padreId: z.number().int().positive().optional().nullable(),
  madreId: z.number().int().positive().optional().nullable(),
})

export async function getAnimales(req: AuthRequest, res: Response) {
  const { especie, estado, search, potreroId, page = '1', limit = '15' } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (especie) where.especie = especie
  if (estado) where.estado = estado
  if (potreroId) where.potreroId = parseInt(potreroId)
  if (search) where.OR = [
    { codigo: { contains: search } },
    { nombre: { contains: search } },
    { raza: { contains: search } },
    { numeroArete: { contains: search } },
  ]
  const pageNum = parseInt(page), limitNum = parseInt(limit)
  const [animales, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      include: { usuario: { select: { nombre: true } }, potrero: { select: { nombre: true } } },
      orderBy: { creadoEn: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.animal.count({ where }),
  ])
  res.json({ animales, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
}

export async function getAnimal(req: AuthRequest, res: Response) {
  const animal = await prisma.animal.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      potrero: true,
      usuario: { select: { nombre: true } },
      registros: { orderBy: { fecha: 'desc' }, take: 20 },
      producciones: { orderBy: { fecha: 'desc' }, take: 20 },
      vacunaciones: { orderBy: { fecha: 'desc' }, take: 20 },
      eventosReproductivos: { orderBy: { fecha: 'desc' }, take: 20 },
      pesajes: { orderBy: { fecha: 'desc' }, take: 30 },
    },
  })
  if (!animal) { res.status(404).json({ error: 'Animal no encontrado' }); return }
  const padre = animal.padreId ? await prisma.animal.findUnique({ where: { id: animal.padreId }, select: { id: true, codigo: true, nombre: true } }) : null
  const madre = animal.madreId ? await prisma.animal.findUnique({ where: { id: animal.madreId }, select: { id: true, codigo: true, nombre: true } }) : null
  res.json({ ...animal, padre, madre })
}

export async function createAnimal(req: AuthRequest, res: Response) {
  const data = animalSchema.parse(req.body)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animal = await prisma.animal.create({ data: { ...data, usuarioId: req.user!.userId } as any })
  if (data.peso) {
    await prisma.pesajeHistorial.create({ data: { animalId: animal.id, peso: data.peso, observaciones: 'Peso inicial al registro' } })
  }
  res.status(201).json(animal)
}

export async function updateAnimal(req: AuthRequest, res: Response) {
  const data = animalSchema.partial().parse(req.body)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animal = await prisma.animal.update({ where: { id: parseInt(req.params.id) }, data: data as any })
  res.json(animal)
}

export async function deleteAnimal(req: AuthRequest, res: Response) {
  await prisma.animal.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Animal eliminado' })
}

export async function getEstadisticas(_req: AuthRequest, res: Response) {
  const [totalAnimales, porEspecie, porEstado, pesoPromedio, porSexo] = await Promise.all([
    prisma.animal.count(),
    prisma.animal.groupBy({ by: ['especie'], _count: true }),
    prisma.animal.groupBy({ by: ['estado'], _count: true }),
    prisma.animal.aggregate({ _avg: { peso: true } }),
    prisma.animal.groupBy({ by: ['sexo'], _count: true }),
  ])
  res.json({ totalAnimales, porEspecie, porEstado, pesoPromedio: pesoPromedio._avg.peso, porSexo })
}
