import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'
import { EstadoTarea, Prioridad } from '@prisma/client'

const schema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()),
  fechaVencimiento: z.string().optional().transform(v => v ? new Date(v) : undefined),
  prioridad: z.nativeEnum(Prioridad).optional(),
  estado: z.nativeEnum(EstadoTarea).optional(),
  animalId: z.number().int().positive().optional(),
  asignadoA: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado'), prioridad = searchParams.get('prioridad')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '15')
  const where: Record<string, unknown> = {}
  if (estado) where.estado = estado
  if (prioridad) where.prioridad = prioridad
  const [total, tareas] = await Promise.all([
    prisma.tarea.count({ where }),
    prisma.tarea.findMany({ where, include: { animal: { select: { codigo: true, nombre: true, especie: true } }, usuario: { select: { nombre: true } } }, orderBy: [{ prioridad: 'asc' }, { fecha: 'asc' }], skip: (page - 1) * limit, take: limit }),
  ])
  return NextResponse.json({ tareas, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = await prisma.tarea.create({ data: data as any })
    return NextResponse.json(t, { status: 201 })
  } catch (e) { return handleError(e) }
}
