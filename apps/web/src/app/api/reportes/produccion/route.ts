import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const dias = parseInt(searchParams.get('dias') || '30')
  const tipo = searchParams.get('tipo')

  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
  const where: Record<string, unknown> = { fecha: { gte: desde } }
  if (tipo) where.tipo = tipo

  const [producciones, porTipo, porAnimal] = await Promise.all([
    prisma.produccion.findMany({ where, include: { animal: { select: { codigo: true, nombre: true, especie: true } } }, orderBy: { fecha: 'desc' }, take: 200 }),
    prisma.produccion.groupBy({ by: ['tipo'], where, _sum: { cantidad: true }, _count: { id: true } }),
    prisma.produccion.groupBy({ by: ['animalId'], where, _sum: { cantidad: true }, _count: { id: true }, orderBy: { _sum: { cantidad: 'desc' } }, take: 10 }),
  ])

  return NextResponse.json({ producciones, porTipo, porAnimal, periodo: { desde, hasta: new Date(), dias } })
}
