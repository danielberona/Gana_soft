import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export async function getDashboard(_req: AuthRequest, res: Response) {
  const [totalAnimales, animalesActivos, porEspecie, porEstado, ultimosAnimales, ultimosRegistrosSalud, produccionReciente] = await Promise.all([
    prisma.animal.count(),
    prisma.animal.count({ where: { estado: 'ACTIVO' } }),
    prisma.animal.groupBy({ by: ['especie'], _count: { id: true } }),
    prisma.animal.groupBy({ by: ['estado'], _count: { id: true } }),
    prisma.animal.findMany({ orderBy: { creadoEn: 'desc' }, take: 5, select: { id: true, codigo: true, nombre: true, especie: true, estado: true, creadoEn: true } }),
    prisma.registroSalud.findMany({ orderBy: { fecha: 'desc' }, take: 5, include: { animal: { select: { codigo: true, nombre: true } } } }),
    prisma.produccion.findMany({ orderBy: { fecha: 'desc' }, take: 5, include: { animal: { select: { codigo: true, nombre: true } } } }),
  ])
  res.json({ resumen: { totalAnimales, animalesActivos, animalesInactivos: totalAnimales - animalesActivos }, porEspecie, porEstado, ultimosAnimales, ultimosRegistrosSalud, produccionReciente })
}

export async function getReporteProduccion(req: AuthRequest, res: Response) {
  const { desde, hasta } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (desde || hasta) where.fecha = { ...(desde ? { gte: new Date(desde) } : {}), ...(hasta ? { lte: new Date(hasta) } : {}) }
  const produccion = await prisma.produccion.groupBy({ by: ['tipo', 'unidad'], _sum: { cantidad: true }, _count: { id: true }, where })
  res.json(produccion)
}