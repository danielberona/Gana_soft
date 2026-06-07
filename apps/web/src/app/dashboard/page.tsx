'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Cow, TrendingUp, CheckSquare, Syringe, ArrowUpRight, Activity, AlertCircle, HeartPulse, Baby, TreePine, BarChart3, Users } from 'lucide-react'
import type { DashboardData, Especie } from '@/types'

const especieLabel: Record<Especie, string> = { BOVINO: 'Bovino', PORCINO: 'Porcino', OVINO: 'Ovino', CAPRINO: 'Caprino', EQUINO: 'Equino', AVICOLA: 'Avícola', OTRO: 'Otro' }
const especieColor: Record<Especie, string> = { BOVINO: 'bg-amber-500', PORCINO: 'bg-pink-500', OVINO: 'bg-sky-500', CAPRINO: 'bg-violet-500', EQUINO: 'bg-orange-500', AVICOLA: 'bg-yellow-400', OTRO: 'bg-gray-400' }
const estadoConfig: Record<string, { color: string; dot: string }> = {
  ACTIVO: { color: 'text-green-700 bg-green-50 ring-green-600/20', dot: 'bg-green-500' },
  VENDIDO: { color: 'text-blue-700 bg-blue-50 ring-blue-600/20', dot: 'bg-blue-500' },
  MUERTO: { color: 'text-red-700 bg-red-50 ring-red-600/20', dot: 'bg-red-500' },
  TRANSFERIDO: { color: 'text-amber-700 bg-amber-50 ring-amber-600/20', dot: 'bg-amber-500' },
}

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
    <div className="p-8 flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando datos...</p>
      </div>
    </div>
  )

  const kpis = [
    { label: 'Total animales', value: data?.resumen.totalAnimales ?? 0, sub: 'en el inventario', icon: Cow, color: 'bg-green-600', href: '/dashboard/animales' },
    { label: 'Activos', value: data?.resumen.animalesActivos ?? 0, sub: `de ${data?.resumen.totalAnimales ?? 0} registrados`, icon: Activity, color: 'bg-emerald-500', href: '/dashboard/animales?estado=ACTIVO' },
    { label: 'Tareas pendientes', value: data?.resumen.tareasPendientes ?? 0, sub: 'por completar', icon: CheckSquare, color: 'bg-amber-500', href: '/dashboard/tareas' },
    { label: 'Vacunas próximas', value: data?.resumen.proximasVacunas ?? 0, sub: 'en los próximos 30 días', icon: Syringe, color: 'bg-blue-500', href: '/dashboard/vacunaciones' },
  ]

  return (
    <div className="p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{saludo()}, {usuario?.nombre.split(' ')[0]}</h2>
        <p className="text-gray-500 text-sm mt-0.5">Aquí está el resumen de tu ganadería</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <Link key={kpi.label} href={kpi.href}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-0.5">{kpi.value}</p>
              <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
            </Link>
          )
        })}
      </div>

      {/* Alertas */}
      {(data?.resumen.proximasVacunas ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{data?.resumen.proximasVacunas} vacunas próximas</span> en los próximos 30 días.{' '}
            <Link href="/dashboard/vacunaciones" className="underline hover:no-underline">Ver detalle →</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Últimos animales */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Últimos registros</h3>
            <Link href="/dashboard/animales" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.ultimosAnimales.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">No hay animales registrados aún</p>
            ) : data?.ultimosAnimales.map(a => {
              const cfg = estadoConfig[a.estado] || estadoConfig.ACTIVO
              return (
                <Link key={a.id} href={`/dashboard/animales/${a.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Cow className="w-4.5 h-4.5 text-gray-400" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{a.nombre || a.codigo}</p>
                    <p className="text-xs text-gray-400">{a.codigo} · {especieLabel[a.especie as Especie] || a.especie}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {a.estado}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Composición del hato */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Composición del hato</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {(data?.porEspecie.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Sin datos</p>
            ) : data?.porEspecie.map(e => {
              const total = data.resumen.totalAnimales || 1
              const pct = Math.round((e._count.id / total) * 100)
              const color = especieColor[e.especie as Especie] || 'bg-gray-400'
              return (
                <div key={e.especie}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="font-medium text-gray-700">{especieLabel[e.especie as Especie] || e.especie}</span>
                    </div>
                    <span className="text-gray-500">{e._count.id} <span className="text-gray-400">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Estado del hato */}
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Por estado</p>
            <div className="grid grid-cols-2 gap-2">
              {data?.porEstado.map(e => {
                const cfg = estadoConfig[e.estado] || estadoConfig.ACTIVO
                return (
                  <div key={e.estado} className={`rounded-xl px-3 py-2.5 ring-1 ring-inset ${cfg.color}`}>
                    <p className="text-lg font-bold">{e._count.id}</p>
                    <p className="text-xs font-medium opacity-80">{e.estado}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Producción reciente */}
      {(data?.produccionReciente.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Producción reciente</h3>
            </div>
            <Link href="/dashboard/produccion" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              Ver todo <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.produccionReciente.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{p.tipo}</p>
                  <p className="text-xs text-gray-400">{p.animal?.nombre || p.animal?.codigo} · {new Date(p.fecha).toLocaleDateString('es-CO')}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{p.cantidad} <span className="text-gray-400 font-normal">{p.unidad}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Acceso rápido</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {[
            { href: '/dashboard/animales', icon: Cow, label: 'Animales', color: 'text-campo-600 bg-campo-50' },
            { href: '/dashboard/salud', icon: HeartPulse, label: 'Salud', color: 'text-red-600 bg-red-50' },
            { href: '/dashboard/vacunaciones', icon: Syringe, label: 'Vacunas', color: 'text-cielo-600 bg-cielo-50' },
            { href: '/dashboard/produccion', icon: TrendingUp, label: 'Producción', color: 'text-emerald-600 bg-emerald-50' },
            { href: '/dashboard/reproduccion', icon: Baby, label: 'Reproducción', color: 'text-pink-600 bg-pink-50' },
            { href: '/dashboard/potreros', icon: TreePine, label: 'Potreros', color: 'text-teal-600 bg-teal-50' },
            { href: '/dashboard/tareas', icon: CheckSquare, label: 'Tareas', color: 'text-tierra-600 bg-tierra-50' },
            { href: '/dashboard/reportes', icon: BarChart3, label: 'Reportes', color: 'text-violet-600 bg-violet-50' },
            { href: '/dashboard/usuarios', icon: Users, label: 'Usuarios', color: 'text-gray-600 bg-gray-100' },
          ].map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-center group">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
