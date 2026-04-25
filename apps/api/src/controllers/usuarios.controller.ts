import { Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { Rol } from '@prisma/client'

const createSchema = z.object({ nombre: z.string().min(2), email: z.string().email(), password: z.string().min(6), rol: z.nativeEnum(Rol).optional() })
const updateSchema = z.object({ nombre: z.string().min(2).optional(), email: z.string().email().optional(), password: z.string().min(6).optional(), rol: z.nativeEnum(Rol).optional(), activo: z.boolean().optional() })

export async function getUsuarios(_req: AuthRequest, res: Response) {
  const usuarios = await prisma.usuario.findMany({ select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true }, orderBy: { creadoEn: 'desc' } })
  res.json(usuarios)
}

export async function createUsuario(req: AuthRequest, res: Response) {
  const data = createSchema.parse(req.body)
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const usuario = await prisma.usuario.create({ data: { ...data, password: hashedPassword }, select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true } })
  res.status(201).json(usuario)
}

export async function updateUsuario(req: AuthRequest, res: Response) {
  const data = updateSchema.parse(req.body)
  const updateData: Record<string, unknown> = { ...data }
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10)
  const usuario = await prisma.usuario.update({ where: { id: parseInt(req.params.id) }, data: updateData, select: { id: true, nombre: true, email: true, rol: true, activo: true } })
  res.json(usuario)
}

export async function deleteUsuario(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id)
  if (req.user!.userId === id) { res.status(400).json({ error: 'No puedes eliminarte a ti mismo' }); return }
  await prisma.usuario.delete({ where: { id } })
  res.json({ message: 'Usuario eliminado' })
}