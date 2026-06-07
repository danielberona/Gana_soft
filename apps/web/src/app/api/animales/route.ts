import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'
import { Especie, Sexo, EstadoAnimal } from '@prisma/client'

const schema = z.object({
  codigo: z.string().min(1), nombre: z.string().optional(), especie: z.nativeEnum(Especie),
  raza: z.string().optional(), sexo: z.nativeEnum(Sexo), color: z.string().optional(),
  numeroArete: z.string().optional(), fechaNac: z.string().optional().transform(v => v ? new Date(v) : undefined),
  peso: z.number().positive().optional(), estado: z.nativeEnum(EstadoAnimal).optional(),
  observaciones: z.string().optional(), potreroId: z.number().optional().nullable(),
  padreId: z.number().optional().nullable(), madreId: z.number().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const especie = searchParams.get('especie'), estado = searchParams.get('estado')
  const search = searchParams.get('search'), potreroId = searchParams.get('potreroId')
  const page = parseInt(searchParams.get('page') || '1'), limit = parseInt(searchParams.get('limit') || '15')
  const where: Record<string, unknown> = {}
  if (especie) where.especie = especie
  if (estado) where.estado = estado
  if (potreroId) where.potreroId = parseInt(potreroId)
  if (search) where.OR = [{ codigo: { contains: search } }, { nombre: { contains: search } }, { raza: { contains: search } }, { numeroArete: { contains: search } }]
  const [animales, total] = await Promise.all([
    prisma.animal.findMany({ where, include: { usuario: { select: { nombre: true } }, potrero: { select: { nombre: true } } }, orderBy: { creadoEn: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.animal.count({ where }),
  ])
  return NextResponse.json({ animales, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const animal = await prisma.animal.create({ data: { ...data, usuarioId: user.userId } as any })
    if (data.peso) await prisma.pesajeHistorial.create({ data: { animalId: animal.id, peso: data.peso, observaciones: 'Peso inicial' } as any })
    return NextResponse.json(animal, { status: 201 })
  } catch (e) { return handleError(e) }
}
