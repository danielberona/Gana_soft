import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, forbidden, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

const schema = z.object({
  vacuna: z.string().min(1).optional(),
  fecha: z.string().optional().transform(v => v ? new Date(v) : undefined),
  proximaDosis: z.string().optional().transform(v => v ? new Date(v) : undefined),
  veterinario: z.string().optional(),
  lote: z.string().optional(),
  costo: z.number().optional(),
  observaciones: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  const { id } = await params
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = await prisma.vacunacion.update({ where: { id: parseInt(id) }, data: data as any })
    return NextResponse.json(v)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const { id } = await params
  await prisma.vacunacion.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ message: 'Vacunación eliminada' })
}
