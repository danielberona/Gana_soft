import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, forbidden, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'
import { TipoEvento } from '@prisma/client'

const schema = z.object({
  tipo: z.nativeEnum(TipoEvento).optional(),
  fecha: z.string().optional().transform(v => v ? new Date(v) : undefined),
  resultado: z.string().optional(),
  observaciones: z.string().optional(),
  costo: z.number().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  const { id } = await params
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = await prisma.eventoReproductivo.update({ where: { id: parseInt(id) }, data: data as any })
    return NextResponse.json(e)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const { id } = await params
  await prisma.eventoReproductivo.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ message: 'Evento eliminado' })
}
