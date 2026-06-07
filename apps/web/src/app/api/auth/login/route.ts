import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma.server'

const JWT_SECRET = process.env.JWT_SECRET || 'ganasoft_secret'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario || !usuario.activo) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    const ok = await bcrypt.compare(password, usuario.password)
    if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    const token = jwt.sign({ userId: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '7d' })
    const res = NextResponse.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } })
    res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    return res
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}
