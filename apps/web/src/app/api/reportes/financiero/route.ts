import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const { searchParams } = new URL(req.url)
  const dias = parseInt(searchParams.get('dias') || '30')
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)

  const [gastosSalud, gastosVacunacion, gastosReproduccion] = await Promise.all([
    prisma.registroSalud.aggregate({ where: { fecha: { gte: desde }, costo: { not: null } }, _sum: { costo: true }, _count: { id: true } }),
    prisma.vacunacion.aggregate({ where: { fecha: { gte: desde }, costo: { not: null } }, _sum: { costo: true }, _count: { id: true } }),
    prisma.eventoReproductivo.aggregate({ where: { fecha: { gte: desde }, costo: { not: null } }, _sum: { costo: true }, _count: { id: true } }),
  ])

  const totalGastos = (gastosSalud._sum.costo || 0) + (gastosVacunacion._sum.costo || 0) + (gastosReproduccion._sum.costo || 0)

  return NextResponse.json({
    periodo: { desde, hasta: new Date(), dias },
    gastos: {
      salud: { total: gastosSalud._sum.costo || 0, registros: gastosSalud._count.id },
      vacunacion: { total: gastosVacunacion._sum.costo || 0, registros: gastosVacunacion._count.id },
      reproduccion: { total: gastosReproduccion._sum.costo || 0, registros: gastosReproduccion._count.id },
      total: totalGastos,
    },
  })
}
