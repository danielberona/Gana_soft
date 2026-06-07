'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { DashboardData, Especie, EstadoAnimal } from '@/types'

const especieEmoji: Record<Especie, string> = { BOVINO: '🐄', PORCINO: '🐷', OVINO: '🐑', CAPRINO: '🐐', EQUINO: '🐴', AVICOLA: '🐔', OTRO: '🐾' }
const estadoColor: Record<string, string> = { ACTIVO: 'bg-green-500', VENDIDO: 'bg-blue-400', MUERTO: 'bg-red-400', TRANSFERIDO: 'bg-yellow-400' }
const estadoBadge: Record<string, string> = { ACTIVO: 'bg-green-100 text-green-700', VENDIDO: 'bg-blue-100 text-blue-700', MUERTO: 'bg-red-100 text-red-700', TRANSFERIDO: 'bg-yellow-100 text-yellow-700' }

interface Financiero { totalCostosSalud: number; totalAtencionesSalud: number; totalCostosVacunas: number; totalVacunaciones: number }
interface ProduccionReporte { tipo: string; unidad: string; _sum: { cantidad: number }; _count: { id: number } }

export default function ReportesPage() {
  const { token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [financiero, setFinanciero] = useState<Financiero | null>(null)
  const [produccion, setProduccion] = useState<ProduccionReporte[]>([])
  const [loading, setLoading] = useState(true)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [vistaActiva, setVistaActiva] = useState<'general' | 'produccion' | 'financiero'>('general')

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get<DashboardData>('/reportes/dashboard', { token }),
      api.get<Financiero>('/reportes/financiero', { token }),
      api.get<ProduccionReporte[]>('/reportes/produccion', { token }),
    ]).then(([d, f, p]) => { setData(d); setFinanciero(f); setProduccion(p) }).catch(console.error).finally(() => setLoading(false))
  }, [token])

  async function buscarProduccion() {
    if (!token) return
    const params = new URLSearchParams()
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    const p = await api.get<ProduccionReporte[]>(`/reportes/produccion?${params}`, { token })
    setProduccion(p)
  }

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="text-center text-gray-400"><div className="text-4xl mb-3">📊</div><p>Generando reportes...</p></div></div>

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="text-gray-500 text-sm">Visión completa de tu ganadería</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total animales', value: data?.resumen.totalAnimales, icon: '🐄' },
          { label: 'Activos', value: data?.resumen.animalesActivos, icon: '✅' },
          { label: 'Partos este mes', value: data?.resumen.partosMes, icon: '🐣' },
          { label: 'Potreros activos', value: data?.resumen.totalPotreros, icon: '🌿' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key: 'general', label: 'General', icon: '📊' }, { key: 'produccion', label: 'Producción', icon: '🥛' }, { key: 'financiero', label: 'Costos', icon: '💰' }].map(t => (
          <button key={t.key} onClick={() => setVistaActiva(t.key as 'general' | 'produccion' | 'financiero')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${vistaActiva === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {vistaActiva === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Distribución por especie</h2>
            <div className="space-y-4">
              {data?.porEspecie.map(e => {
                const total = data.resumen.totalAnimales || 1
                const pct = Math.round((e._count.id / total) * 100)
                return (
                  <div key={e.especie}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>{especieEmoji[e.especie]} {e.especie}</span>
                      <span className="font-bold">{e._count.id} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Estado del hato</h2>
            <div className="space-y-3">
              {data?.porEstado.map(e => {
                const total = data.resumen.totalAnimales || 1
                const pct = Math.round((e._count.id / total) * 100)
                return (
                  <div key={e.estado} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge[e.estado]}`}>{e.estado}</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${estadoColor[e.estado] || 'bg-gray-400'} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-bold text-sm">{e._count.id}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Últimos registros de salud</h2>
            {(data?.ultimosRegistrosSalud?.length ?? 0) === 0 ? <p className="text-gray-400 text-center py-6">Sin registros</p> : (
              <div className="divide-y divide-gray-50">
                {data?.ultimosRegistrosSalud.map(r => (
                  <div key={r.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <span className="font-medium text-sm text-gray-900">{r.tipo}</span>
                      <span className="text-gray-400 text-sm ml-2">· {r.animal?.nombre || r.animal?.codigo}</span>
                    </div>
                    {r.costo != null && <span className="text-sm font-medium text-gray-600">${r.costo.toLocaleString()}</span>}
                    <span className="text-xs text-gray-400">{new Date(r.fecha).toLocaleDateString('es-CO')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {vistaActiva === 'produccion' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex gap-3 items-end flex-wrap">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Desde</label><input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Hasta</label><input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" /></div>
              <button onClick={buscarProduccion} className="px-4 py-2 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>Filtrar</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produccion.length === 0 ? (
              <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100"><div className="text-4xl mb-2">🥛</div><p>Sin datos de producción</p></div>
            ) : produccion.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">{p.tipo}</p>
                <p className="text-3xl font-bold text-gray-900">{p._sum?.cantidad?.toLocaleString() ?? 0}</p>
                <p className="text-sm text-gray-500">{p.unidad}</p>
                <p className="text-xs text-gray-400 mt-1">{p._count?.id ?? 0} registros</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {vistaActiva === 'financiero' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🏥</span>
              <h3 className="font-semibold text-gray-900">Costos de salud</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">${(financiero?.totalCostosSalud ?? 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">{financiero?.totalAtencionesSalud ?? 0} atenciones registradas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💉</span>
              <h3 className="font-semibold text-gray-900">Costos de vacunación</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">${(financiero?.totalCostosVacunas ?? 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">{financiero?.totalVacunaciones ?? 0} vacunaciones registradas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💰</span>
              <h3 className="font-semibold text-gray-900">Total costos sanitarios</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">${((financiero?.totalCostosSalud ?? 0) + (financiero?.totalCostosVacunas ?? 0)).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Suma de costos de salud y vacunación registrados</p>
          </div>
        </div>
      )}
    </div>
  )
}
