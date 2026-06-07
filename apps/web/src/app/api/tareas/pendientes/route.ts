import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const tareas = await prisma.tarea.findMany({
    where: { estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } },
    include: { animal: { select: { id: true, codigo: true, nombre: true } } },
    orderBy: [{ prioridad: 'asc' }, { fechaVencimiento: 'asc' }],
    take: 50,
  })
  return NextResponse.json(tareas)
}
