import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { authenticate, unauth, forbidden, handleError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const { id } = await params
  try {
    const body = await req.json()
    const updateData: Record<string, unknown> = { ...body }
    if (body.password) updateData.password = await bcrypt.hash(body.password, 10)
    const usuario = await prisma.usuario.update({ where: { id: parseInt(id) }, data: updateData, select: { id: true, nombre: true, email: true, rol: true, activo: true } })
    return NextResponse.json(usuario)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req); if (!user) return unauth()
  if (user.rol !== 'ADMIN') return forbidden()
  const { id } = await params
  if (user.userId === parseInt(id)) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
  await prisma.usuario.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ message: 'Usuario eliminado' })
}
