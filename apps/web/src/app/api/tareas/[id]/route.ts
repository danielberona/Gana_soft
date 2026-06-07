import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, forbidden, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'
import { EstadoTarea, Prioridad } from '@prisma/client'

const schema = z.object({
  titulo: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  fecha: z.string().optional().transform(v => v ? new Date(v) : undefined),
  fechaVencimiento: z.string().optional().transform(v => v ? new Date(v) : undefined),
  prioridad: z.nativeEnum(Prioridad).optional(),
  estado: z.nativeEnum(EstadoTarea).optional(),
  asignadoA: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  const { id } = await params
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = await prisma.tarea.update({ where: { id: parseInt(id) }, data: data as any })
    return NextResponse.json(t)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const { id } = await params
  await prisma.tarea.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ message: 'Tarea eliminada' })
}
