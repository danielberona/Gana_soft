'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { DashboardData, Especie } from '@/types'

const especieEmoji: Record<Especie, string> = { BOVINO: '🐄', PORCINO: '🐷', OVINO: '🐑', CAPRINO: '🐐', EQUINO: '🐴', AVICOLA: '🐔', OTRO: '🐾' }
const estadoColor: Record<string, string> = { ACTIVO: 'bg-green-100 text-green-700', VENDIDO: 'bg-blue-100 text-blue-700', MUERTO: 'bg-red-100 text-red-700', TRANSFERIDO: 'bg-yellow-100 text-yellow-700' }

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardPage() {
  const { token, usuario } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.get<DashboardData>('/reportes/dashboard', { token })
      .then(setData).catch(console.error).finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-center text-gray-400"><div className="text-4xl mb-3">🐄</div><p>Cargando datos...</p></div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{saludo()}, {usuario?.nombre.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Resumen de tu ganadería al día de hoy</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '🐄', label: 'Total animales', value: data?.resumen.totalAnimales ?? 0, color: 'border-green-200 bg-green-50', href: '/dashboard/animales' },
          { icon: '✅', label: 'Activos', value: data?.resumen.animalesActivos ?? 0, color: 'border-blue-200 bg-blue-50', href: '/dashboard/animales?estado=ACTIVO' },
          { icon: '✅', label: 'Tareas pendientes', value: data?.resumen.tareasPendientes ?? 0, color: 'border-orange-200 bg-orange-50', href: '/dashboard/tareas' },
          { icon: '💉', label: 'Vacunas próximas', value: data?.resumen.proximasVacunas ?? 0, color: 'border-purple-200 bg-purple-50', href: '/dashboard/vacunaciones' },
        ].map(({ icon, label, value, color, href }) => (
          <Link key={label} href={href} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${color} hover:shadow-md transition-shadow`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-5">
        {/* Últimos animales */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Últimos registros</h2>
            <Link href="/dashboard/animales" className="text-xs text-green-600 hover:underline">Ver todos →</Link>
          </div>
          {data?.ultimosAnimales.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No hay animales aún</p>
          ) : (
            <div className="space-y-2">
              {data?.ultimosAnimales.map(a => (
                <Link key={a.id} href={`/dashboard/animales/${a.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                  <span className="text-xl">{especieEmoji[a.especie]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{a.nombre || a.codigo}</p>
                    <p className="text-xs text-gray-400">{a.codigo} · {a.especie}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[a.estado]}`}>{a.estado}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Distribución por especie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Por especie</h2>
          <div className="space-y-3">
            {data?.porEspecie.map(e => {
              const total = data.resumen.totalAnimales || 1
              const pct = Math.round((e._count.id / total) * 100)
              return (
                <div key={e.especie}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{especieEmoji[e.especie]} {e.especie}</span>
                    <span className="font-medium">{e._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Estado del hato */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Estado del hato</h2>
          <div className="space-y-3">
            {data?.porEstado.map(e => {
              const total = data.resumen.totalAnimales || 1
              const pct = Math.round((e._count.id / total) * 100)
              const colors: Record<string, string> = { ACTIVO: 'bg-green-500', VENDIDO: 'bg-blue-400', MUERTO: 'bg-red-400', TRANSFERIDO: 'bg-yellow-400' }
              return (
                <div key={e.estado}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{e.estado}</span>
                    <span className="font-medium">{e._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[e.estado] || 'bg-gray-400'} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Acceso rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { href: '/dashboard/animales', icon: '🐄', label: 'Animales' },
            { href: '/dashboard/salud', icon: '🏥', label: 'Salud' },
            { href: '/dashboard/vacunaciones', icon: '💉', label: 'Vacunas' },
            { href: '/dashboard/produccion', icon: '🥛', label: 'Producción' },
            { href: '/dashboard/reproduccion', icon: '🐣', label: 'Reproducción' },
            { href: '/dashboard/potreros', icon: '🌿', label: 'Potreros' },
            { href: '/dashboard/tareas', icon: '✅', label: 'Tareas' },
            { href: '/dashboard/reportes', icon: '📈', label: 'Reportes' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition text-center">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium text-gray-600">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
