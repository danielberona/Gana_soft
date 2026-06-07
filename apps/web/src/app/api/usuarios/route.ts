import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authenticate, unauth, forbidden, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'
import { Rol } from '@prisma/client'

const schema = z.object({ nombre: z.string().min(2), email: z.string().email(), password: z.string().min(6), rol: z.nativeEnum(Rol).optional() })

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const usuarios = await prisma.usuario.findMany({ select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true }, orderBy: { creadoEn: 'desc' } })
  return NextResponse.json(usuarios)
}

export async function POST(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  try {
    const data = schema.parse(await req.json())
    const password = await bcrypt.hash(data.password, 10)
    const usuario = await prisma.usuario.create({ data: { nombre: data.nombre, email: data.email, password, rol: data.rol }, select: { id: true, nombre: true, email: true, rol: true, activo: true, creadoEn: true } })
    return NextResponse.json(usuario, { status: 201 })
  } catch (e) { return handleError(e) }
}
