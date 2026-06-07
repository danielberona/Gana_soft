import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, notFound, forbidden, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

const schema = z.object({ nombre: z.string().min(1).optional(), descripcion: z.string().optional(), hectareas: z.number().positive().optional(), capacidad: z.number().int().positive().optional() })

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  const { id } = await params
  const potrero = await prisma.potrero.findUnique({ where: { id: parseInt(id) }, include: { animales: { select: { id: true, codigo: true, nombre: true, especie: true, estado: true } }, _count: { select: { animales: true } } } })
  if (!potrero) return notFound('Potrero no encontrado')
  return NextResponse.json(potrero)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  const { id } = await params
  try {
    const data = schema.parse(await req.json())
    const potrero = await prisma.potrero.update({ where: { id: parseInt(id) }, data })
    return NextResponse.json(potrero)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const { id } = await params
  await prisma.potrero.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ message: 'Potrero eliminado' })
}
