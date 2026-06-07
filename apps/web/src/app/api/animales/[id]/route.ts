import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, unauth, notFound, forbidden, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'
import { Especie, Sexo, EstadoAnimal } from '@prisma/client'

const schema = z.object({
  codigo: z.string().min(1).optional(), nombre: z.string().optional(), especie: z.nativeEnum(Especie).optional(),
  raza: z.string().optional(), sexo: z.nativeEnum(Sexo).optional(), color: z.string().optional(),
  numeroArete: z.string().optional(), fechaNac: z.string().optional().transform(v => v ? new Date(v) : undefined),
  peso: z.number().positive().optional(), estado: z.nativeEnum(EstadoAnimal).optional(),
  observaciones: z.string().optional(), potreroId: z.number().optional().nullable(),
  padreId: z.number().optional().nullable(), madreId: z.number().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  const { id } = await params
  const animal = await prisma.animal.findUnique({
    where: { id: parseInt(id) },
    include: { potrero: true, usuario: { select: { nombre: true } }, registros: { orderBy: { fecha: 'desc' }, take: 20 }, producciones: { orderBy: { fecha: 'desc' }, take: 20 }, vacunaciones: { orderBy: { fecha: 'desc' }, take: 20 }, eventosReproductivos: { orderBy: { fecha: 'desc' }, take: 20 }, pesajes: { orderBy: { fecha: 'desc' }, take: 30 } },
  })
  if (!animal) return notFound('Animal no encontrado')
  const padre = animal.padreId ? await prisma.animal.findUnique({ where: { id: animal.padreId }, select: { id: true, codigo: true, nombre: true } }) : null
  const madre = animal.madreId ? await prisma.animal.findUnique({ where: { id: animal.madreId }, select: { id: true, codigo: true, nombre: true } }) : null
  return NextResponse.json({ ...animal, padre, madre })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  const { id } = await params
  try {
    const data = schema.parse(await req.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const animal = await prisma.animal.update({ where: { id: parseInt(id) }, data: data as any })
    return NextResponse.json(animal)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const { id } = await params
  await prisma.animal.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ message: 'Animal eliminado' })
}
