import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

const schema = z.object({ nombre: z.string().min(1), descripcion: z.string().optional(), hectareas: z.number().positive().optional(), capacidad: z.number().int().positive().optional() })

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const potreros = await prisma.potrero.findMany({ include: { _count: { select: { animales: true } } }, orderBy: { nombre: 'asc' } })
  return NextResponse.json(potreros)
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  try {
    const data = schema.parse(await req.json())
    const potrero = await prisma.potrero.create({ data })
    return NextResponse.json(potrero, { status: 201 })
  } catch (e) { return handleError(e) }
}
