import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'ganasoft_secret'

export type AuthUser = { userId: number; rol: string }

export function authenticate(req: NextRequest): AuthUser | null {
  const auth = req.headers.get('authorization')
  const token = auth?.replace('Bearer ', '') || req.cookies.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export const unauth = () => NextResponse.json({ error: 'No autorizado' }, { status: 401 })
export const forbidden = () => NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
export const notFound = (msg = 'No encontrado') => NextResponse.json({ error: msg }, { status: 404 })

export function handleError(e: unknown) {
  if (e instanceof Error && e.message.includes('ZodError')) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  console.error(e)
  return NextResponse.json({ error: 'Error interno' }, { status: 500 })
}
