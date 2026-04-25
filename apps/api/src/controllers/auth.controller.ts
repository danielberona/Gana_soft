import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { signToken } from '../utils/jwt'
import { AuthRequest } from '../middleware/auth.middleware'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body)
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario || !usuario.activo) { res.status(401).json({ error: 'Credenciales incorrectas' }); return }
  const valid = await bcrypt.compare(password, usuario.password)
  if (!valid) { res.status(401).json({ error: 'Credenciales incorrectas' }); return }
  const token = signToken({ userId: usuario.id, email: usuario.email, rol: usuario.rol })
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, token })
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token')
  res.json({ message: 'Sesión cerrada' })
}

export async function me(req: AuthRequest, res: Response) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  })
  if (!usuario) { res.status(404).json({ error: 'Usuario no encontrado' }); return }
  res.json(usuario)
}