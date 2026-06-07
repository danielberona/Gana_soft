import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

const schema = z.object({ animalId: z.number().int().positive(), peso: z.number().positive(), fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()), observaciones: z.string().optional() })

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const animalId = searchParams.get('animalId')
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  const pesajes = await prisma.pesajeHistorial.findMany({ where, include: { animal: { select: { codigo: true, nombre: true } } }, orderBy: { fecha: 'desc' }, take: 100 })
  return NextResponse.json(pesajes)
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = await prisma.pesajeHistorial.create({ data: data as any })
    // Update animal's current weight
    await prisma.animal.update({ where: { id: data.animalId }, data: { peso: data.peso } })
    return NextResponse.json(p, { status: 201 })
  } catch (e) { return handleError(e) }
}
