import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()

  const hoy = new Date()
  const hace30 = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
  const en30 = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const [
    totalAnimales,
    animalesActivos,
    tareasPendientes,
    proximasVacunas,
    partosMes,
    totalPotreros,
    porEspecie,
    porEstado,
    ultimosAnimales,
    ultimosRegistrosSalud,
    produccionReciente,
  ] = await Promise.all([
    prisma.animal.count(),
    prisma.animal.count({ where: { estado: 'ACTIVO' } }),
    prisma.tarea.count({ where: { estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
    prisma.vacunacion.count({ where: { proximaDosis: { gte: hoy, lte: en30 } } }),
    prisma.eventoReproductivo.count({ where: { tipo: 'PARTO', fecha: { gte: inicioMes } } }),
    prisma.potrero.count(),
    prisma.animal.groupBy({ by: ['especie'], _count: { id: true } }),
    prisma.animal.groupBy({ by: ['estado'], _count: { id: true } }),
    prisma.animal.findMany({ orderBy: { creadoEn: 'desc' }, take: 8, select: { id: true, codigo: true, nombre: true, especie: true, estado: true, creadoEn: true } }),
    prisma.registroSalud.findMany({ where: { fecha: { gte: hace30 } }, include: { animal: { select: { codigo: true, nombre: true } } }, orderBy: { fecha: 'desc' }, take: 5 }),
    prisma.produccion.findMany({ where: { fecha: { gte: hace30 } }, include: { animal: { select: { codigo: true, nombre: true } } }, orderBy: { fecha: 'desc' }, take: 10 }),
  ])

  return NextResponse.json({
    resumen: { totalAnimales, animalesActivos, animalesInactivos: totalAnimales - animalesActivos, tareasPendientes, proximasVacunas, partosMes, totalPotreros },
    porEspecie,
    porEstado,
    ultimosAnimales,
    ultimosRegistrosSalud,
    produccionReciente,
  })
}
