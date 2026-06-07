import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

const schema = z.object({ animalId: z.number().int().positive(), tipo: z.string().min(1), cantidad: z.number().positive(), unidad: z.string().min(1), fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()) })

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const animalId = searchParams.get('animalId'), tipo = searchParams.get('tipo')
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  if (tipo) where.tipo = tipo
  const producciones = await prisma.produccion.findMany({ where, include: { animal: { select: { codigo: true, nombre: true } } }, orderBy: { fecha: 'desc' }, take: 100 })
  return NextResponse.json(producciones)
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = await prisma.produccion.create({ data: data as any })
    return NextResponse.json(p, { status: 201 })
  } catch (e) { return handleError(e) }
}
