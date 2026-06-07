import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function GET(req: NextRequest) {
  const user = authenticate(req)
  if (!user) return unauth()
  const usuario = await prisma.usuario.findUnique({ where: { id: user.userId }, select: { id: true, nombre: true, email: true, rol: true } })
  if (!usuario) return unauth()
  return NextResponse.json(usuario)
}
