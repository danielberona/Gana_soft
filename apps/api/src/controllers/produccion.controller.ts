import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const produccionSchema = z.object({ animalId: z.number().int().positive(), tipo: z.string().min(1), cantidad: z.number().positive(), unidad: z.string().min(1), fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()) })
const saludSchema = z.object({ animalId: z.number().int().positive(), tipo: z.string().min(1), descripcion: z.string().min(1), fecha: z.string().optional().transform(v => v ? new Date(v) : new Date()), veterinario: z.string().optional(), costo: z.number().optional() })

export async function getProduccion(req: AuthRequest, res: Response) {
  const { animalId, tipo } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  if (tipo) where.tipo = tipo
  const producciones = await prisma.produccion.findMany({ where, include: { animal: { select: { codigo: true, nombre: true } } }, orderBy: { fecha: 'desc' }, take: 100 })
  res.json(producciones)
}

export async function createProduccion(req: AuthRequest, res: Response) {
  const data = produccionSchema.parse(req.body)
  const produccion = await prisma.produccion.create({ data })
  res.status(201).json(produccion)
}

export async function getRegistrosSalud(req: AuthRequest, res: Response) {
  const { animalId } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (animalId) where.animalId = parseInt(animalId)
  const registros = await prisma.registroSalud.findMany({ where, include: { animal: { select: { codigo: true, nombre: true } } }, orderBy: { fecha: 'desc' }, take: 100 })
  res.json(registros)
}

export async function createRegistroSalud(req: AuthRequest, res: Response) {
  const data = saludSchema.parse(req.body)
  const registro = await prisma.registroSalud.create({ data })
  res.status(201).json(registro)
}