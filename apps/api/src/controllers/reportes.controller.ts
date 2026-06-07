import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export async function getDashboard(_req: AuthRequest, res: Response) {
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const en30dias = new Date()
  en30dias.setDate(en30dias.getDate() + 30)

  const [
    totalAnimales, animalesActivos,
    porEspecie, porEstado,
    ultimosAnimales, ultimosRegistrosSalud, produccionReciente,
    tareasPendientes, proximasVacunas,
    partosMes, totalPotreros,
  ] = await Promise.all([
    prisma.animal.count(),
    prisma.animal.count({ where: { estado: 'ACTIVO' } }),
    prisma.animal.groupBy({ by: ['especie'], _count: { id: true } }),
    prisma.animal.groupBy({ by: ['estado'], _count: { id: true } }),
    prisma.animal.findMany({
      orderBy: { creadoEn: 'desc' }, take: 5,
      select: { id: true, codigo: true, nombre: true, especie: true, estado: true, creadoEn: true, potrero: { select: { nombre: true } } },
    }),
    prisma.registroSalud.findMany({
      orderBy: { fecha: 'desc' }, take: 5,
      include: { animal: { select: { codigo: true, nombre: true } } },
    }),
    prisma.produccion.findMany({
      orderBy: { fecha: 'desc' }, take: 5,
      include: { animal: { select: { codigo: true, nombre: true } } },
    }),
    prisma.tarea.count({ where: { estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
    prisma.vacunacion.count({ where: { proximaFecha: { lte: en30dias, gte: hoy } } }),
    prisma.eventoReproductivo.count({ where: { tipo: 'PARTO', fecha: { gte: inicioMes } } }),
    prisma.potrero.count({ where: { activo: true } }),
  ])

  res.json({
    resumen: { totalAnimales, animalesActivos, animalesInactivos: totalAnimales - animalesActivos, tareasPendientes, proximasVacunas, partosMes, totalPotreros },
    porEspecie, porEstado,
    ultimosAnimales, ultimosRegistrosSalud, produccionReciente,
  })
}

export async function getReporteProduccion(req: AuthRequest, res: Response) {
  const { desde, hasta, tipo } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (desde || hasta) where.fecha = { ...(desde ? { gte: new Date(desde) } : {}), ...(hasta ? { lte: new Date(hasta) } : {}) }
  if (tipo) where.tipo = tipo
  const [porTipo, totalCostosSalud, produccionDiaria] = await Promise.all([
    prisma.produccion.groupBy({ by: ['tipo', 'unidad'], _sum: { cantidad: true }, _count: { id: true }, where }),
    prisma.registroSalud.aggregate({ _sum: { costo: true }, where: where.fecha ? { fecha: where.fecha as object } : {} }),
    prisma.produccion.findMany({
      where,
      orderBy: { fecha: 'asc' },
      select: { fecha: true, tipo: true, cantidad: true, unidad: true, animal: { select: { codigo: true, nombre: true } } },
      take: 500,
    }),
  ])
  res.json({ porTipo, totalCostosSalud: totalCostosSalud._sum.costo ?? 0, produccionDiaria })
}

export async function getReporteFinanciero(req: AuthRequest, res: Response) {
  const { desde, hasta } = req.query as Record<string, string>
  const fechaFiltro = { ...(desde ? { gte: new Date(desde) } : {}), ...(hasta ? { lte: new Date(hasta) } : {}) }
  const where = Object.keys(fechaFiltro).length ? { fecha: fechaFiltro } : {}

  const [costosSalud, costosVacunas, costosPorEspecie] = await Promise.all([
    prisma.registroSalud.aggregate({ _sum: { costo: true }, _count: { id: true }, where }),
    prisma.vacunacion.aggregate({ _sum: { costo: true }, _count: { id: true }, where }),
    prisma.registroSalud.groupBy({
      by: ['animalId'],
      _sum: { costo: true },
      where,
      orderBy: { _sum: { costo: 'desc' } },
      take: 10,
    }),
  ])

  res.json({
    totalCostosSalud: costosSalud._sum.costo ?? 0,
    totalAtencionesSalud: costosSalud._count.id,
    totalCostosVacunas: costosVacunas._sum.costo ?? 0,
    totalVacunaciones: costosVacunas._count.id,
    costosPorAnimal: costosPorEspecie,
  })
}
