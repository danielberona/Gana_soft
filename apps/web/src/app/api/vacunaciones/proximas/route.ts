import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const dias = parseInt(new URL(req.url).searchParams.get('dias') || '30')
  const hoy = new Date()
  const en30dias = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000)
  const proximas = await prisma.vacunacion.findMany({
    where: { proximaDosis: { gte: hoy, lte: en30dias } },
    include: { animal: { select: { id: true, codigo: true, nombre: true, especie: true } } },
    orderBy: { proximaDosis: 'asc' },
    take: 50,
  })
  return NextResponse.json(proximas)
}
