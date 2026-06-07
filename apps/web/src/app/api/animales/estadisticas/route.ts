import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma.server'

export async function GET(req: NextRequest) {
  const user = authenticate(req); if (!user) return unauth()
  const [totalAnimales, porEspecie, porEstado, pesoPromedio, porSexo] = await Promise.all([
    prisma.animal.count(),
    prisma.animal.groupBy({ by: ['especie'], _count: true }),
    prisma.animal.groupBy({ by: ['estado'], _count: true }),
    prisma.animal.aggregate({ _avg: { peso: true } }),
    prisma.animal.groupBy({ by: ['sexo'], _count: true }),
  ])
  return NextResponse.json({ totalAnimales, porEspecie, porEstado, pesoPromedio: pesoPromedio._avg.peso, porSexo })
}
