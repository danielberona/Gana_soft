import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'
import { TipoEvento } from '@prisma/client'

const schema = z.object({
  animalId: z.number().int().positive(),
  tipo: z.nativeEnum(TipoEvento),
  fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()),
  resultado: z.string().optional(),
  observaciones: z.string().optional(),
  costo: z.number().optional(),
})

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const animalId = searchParams.get('animalId'), tipo = searchParams.get('tipo')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '15')
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  if (tipo) where.tipo = tipo
  const [total, eventos] = await Promise.all([
    prisma.eventoReproductivo.count({ where }),
    prisma.eventoReproductivo.findMany({ where, include: { animal: { select: { codigo: true, nombre: true, especie: true, sexo: true } } }, orderBy: { fecha: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ])
  return NextResponse.json({ eventos, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = await prisma.eventoReproductivo.create({ data: data as any })
    return NextResponse.json(e, { status: 201 })
  } catch (e) { return handleError(e) }
}
