'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { DashboardData, Especie } from '@/types'
const especieEmoji: Record<Especie, string> = { BOVINO:'🐄',PORCINO:'🐷',OVINO:'🐑',CAPRINO:'🐐',EQUINO:'🐴',AVICOLA:'🐔',OTRO:'🐾' }
export default function DashboardPage() {
  const { token, usuario } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!token) return
    api.get<DashboardData>('/reportes/dashboard', { token }).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [token])
  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="text-center text-gray-400"><div className="text-4xl mb-3">⚙️</div><p>Cargando datos...</p></div></div>
  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buenos días, {usuario?.nombre.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Resumen de tu ganadería</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          { icon:'🐄', label:'Total animales', value: data?.resumen.totalAnimales ?? 0 },
          { icon:'✅', label:'Activos', value: data?.resumen.animalesActivos ?? 0 },
          { icon:'⚠️', label:'Inactivos', value: data?.resumen.animalesInactivos ?? 0 },
          { icon:'🌿', label:'Especies', value: data?.porEspecie.length ?? 0 },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">{icon}</div>
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Últimos animales registrados</h2>
          {data?.ultimosAnimales.length === 0 ? <p className="text-gray-400 text-center py-8">No hay animales aún</p> : (
            <div className="space-y-3">
              {data?.ultimosAnimales.map(a => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                  <span className="text-2xl">{especieEmoji[a.especie]}</span>
                  <div className="flex-1"><p className="font-medium text-gray-900 text-sm">{a.nombre || a.codigo}</p><p className="text-xs text-gray-400">{a.codigo} · {a.especie}</p></div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{a.estado}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Por especie</h2>
          <div className="space-y-3">
            {data?.porEspecie.map(e => {
              const total = data.resumen.totalAnimales || 1
              const pct = Math.round((e._count.id / total) * 100)
              return (
                <div key={e.especie}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{especieEmoji[e.especie]} {e.especie}</span>
                    <span className="font-medium">{e._count.id}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{width:`${pct}%`}} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
