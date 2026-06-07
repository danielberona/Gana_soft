import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

const schema = z.object({
  animalId: z.number().int().positive(),
  vacuna: z.string().min(1),
  fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()),
  proximaDosis: z.string().optional().transform(v => v ? new Date(v) : undefined),
  veterinario: z.string().optional(),
  dosis: z.string().optional(),
  lote: z.string().optional(),
  costo: z.number().optional(),
  observaciones: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const animalId = searchParams.get('animalId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '15')
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  const [total, vacunaciones] = await Promise.all([
    prisma.vacunacion.count({ where }),
    prisma.vacunacion.findMany({ where, include: { animal: { select: { codigo: true, nombre: true, especie: true } } }, orderBy: { fecha: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ])
  return NextResponse.json({ vacunaciones, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = await prisma.vacunacion.create({ data: data as any })
    return NextResponse.json(v, { status: 201 })
  } catch (e) { return handleError(e) }
}
