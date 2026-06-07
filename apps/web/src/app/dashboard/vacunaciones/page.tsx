'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { Vacunacion, Animal, PaginatedVacunaciones } from '@/types'

const vacunasComunes = ['Aftosa', 'Brucelosis', 'Carbunco', 'Rabia', 'IBR', 'BVD', 'Leptospirosis', 'Clostridiasis', 'Newcastle', 'Gumboro', 'Otra']

export default function VacunacionesPage() {
  const { token } = useAuth()
  const [pag, setPag] = useState<PaginatedVacunaciones | null>(null)
  const [proximas, setProximas] = useState<Vacunacion[]>([])
  const [animales, setAnimales] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [vistaActiva, setVistaActiva] = useState<'historial' | 'proximas'>('historial')
  const [form, setForm] = useState({ animalId: '', vacuna: '', dosis: '', lote: '', fecha: new Date().toISOString().slice(0, 10), proximaFecha: '', veterinario: '', costo: '' })

  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [vacData, prox] = await Promise.all([
        api.get<PaginatedVacunaciones>(`/vacunaciones?page=${page}&limit=15`, { token }),
        api.get<Vacunacion[]>('/vacunaciones/proximas?dias=60', { token }),
      ])
      setPag(vacData)
      setProximas(prox)
    } finally { setLoading(false) }
  }, [token, page])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    if (!token) return
    api.get<{ animales: Animal[] }>('/animales?limit=200', { token }).then(r => setAnimales(r.animales)).catch(console.error)
  }, [token])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      await api.post('/vacunaciones', {
        ...form, animalId: parseInt(form.animalId),
        costo: form.costo ? parseFloat(form.costo) : undefined,
        proximaFecha: form.proximaFecha || undefined,
        dosis: form.dosis || undefined, lote: form.lote || undefined, veterinario: form.veterinario || undefined,
      }, { token: token! })
      setShowModal(false)
      setForm({ animalId: '', vacuna: '', dosis: '', lote: '', fecha: new Date().toISOString().slice(0, 10), proximaFecha: '', veterinario: '', costo: '' })
      fetchData()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') } finally { setSaving(false) }
  }

  function diasHasta(fecha: string) {
    const diff = new Date(fecha).getTime() - Date.now()
    return Math.ceil(diff / 86400000)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vacunaciones</h1>
          <p className="text-gray-500 text-sm">{pag ? `${pag.total} registros` : 'Cargando...'} · {proximas.length} próximas en 60 días</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Registrar vacunación</button>
      </div>

      {/* Alertas próximas vacunas */}
      {proximas.length > 0 && (
        <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500">🔔</span>
            <h3 className="font-semibold text-orange-800 text-sm">Vacunas próximas ({proximas.length})</h3>
          </div>
          <div className="space-y-2">
            {proximas.slice(0, 5).map(v => {
              const dias = diasHasta(v.proximaFecha!)
              return (
                <div key={v.id} className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dias <= 7 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {dias <= 0 ? 'Vencida' : `${dias} días`}
                  </span>
                  <Link href={`/dashboard/animales/${v.animalId}`} className="text-green-600 hover:underline font-medium">
                    {v.animal?.nombre || v.animal?.codigo}
                  </Link>
                  <span className="text-gray-600">· {v.vacuna}</span>
                  <span className="text-gray-400 ml-auto">{new Date(v.proximaFecha!).toLocaleDateString('es-CO')}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key: 'historial', label: 'Historial', icon: '📋' }, { key: 'proximas', label: 'Próximas', icon: '🔔' }].map(t => (
          <button key={t.key} onClick={() => setVistaActiva(t.key as 'historial' | 'proximas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${vistaActiva === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">💉</div><p>Cargando...</p></div>
        ) : vistaActiva === 'historial' ? (
          (pag?.vacunaciones?.length ?? 0) === 0 ? (
            <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">💉</div><p>No hay vacunaciones registradas</p></div>
          ) : (
            <>
              <table className="w-full">
                <thead><tr className="border-b border-gray-100 bg-gray-50">
                  {['Animal', 'Vacuna', 'Dosis/Lote', 'Veterinario', 'Fecha', 'Próxima dosis'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {pag?.vacunaciones?.map((v: Vacunacion) => (
                    <tr key={v.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        {v.animal ? <Link href={`/dashboard/animales/${v.animalId}`} className="text-sm text-green-600 hover:underline font-medium">{v.animal.nombre || v.animal.codigo}</Link> : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">💉 {v.vacuna}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{[v.dosis, v.lote].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{v.veterinario || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(v.fecha).toLocaleDateString('es-CO')}</td>
                      <td className="px-4 py-3">
                        {v.proximaFecha ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diasHasta(v.proximaFecha) <= 7 ? 'bg-red-100 text-red-700' : diasHasta(v.proximaFecha) <= 30 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                            {new Date(v.proximaFecha).toLocaleDateString('es-CO')}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pag && pag.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span className="text-gray-500">Página {pag.page} de {pag.totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pag.page === 1} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">← Anterior</button>
                    <button onClick={() => setPage(p => Math.min(pag.totalPages, p + 1))} disabled={pag.page === pag.totalPages} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">Siguiente →</button>
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          proximas.length === 0 ? (
            <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">✅</div><p>No hay vacunas próximas en los siguientes 60 días</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {proximas.map((v: Vacunacion) => {
                const dias = diasHasta(v.proximaFecha!)
                return (
                  <div key={v.id} className="p-4 flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${dias <= 0 ? 'bg-red-100 text-red-700' : dias <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {dias <= 0 ? '¡Vencida!' : `${dias} días`}
                    </span>
                    <div className="flex-1">
                      <Link href={`/dashboard/animales/${v.animalId}`} className="font-medium text-green-600 hover:underline text-sm">{v.animal?.nombre || v.animal?.codigo}</Link>
                      <p className="text-sm text-gray-600">💉 {v.vacuna}{v.dosis && ` · ${v.dosis}`}</p>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(v.proximaFecha!).toLocaleDateString('es-CO')}</span>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between">
              <h2 className="text-lg font-bold">Registrar vacunación</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Animal *</label>
                <select value={form.animalId} onChange={e => setForm(p => ({ ...p, animalId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                  <option value="">Seleccionar animal...</option>
                  {animales.map(a => <option key={a.id} value={a.id}>{a.nombre || a.codigo} ({a.especie})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Vacuna *</label>
                  <select value={form.vacuna} onChange={e => setForm(p => ({ ...p, vacuna: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                    <option value="">Seleccionar...</option>
                    {vacunasComunes.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Dosis</label>
                  <input value={form.dosis} onChange={e => setForm(p => ({ ...p, dosis: e.target.value }))} placeholder="Ej: 2ml, 1 dosis" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Número de lote</label>
                  <input value={form.lote} onChange={e => setForm(p => ({ ...p, lote: e.target.value }))} placeholder="Número de lote" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Veterinario</label>
                  <input value={form.veterinario} onChange={e => setForm(p => ({ ...p, veterinario: e.target.value }))} placeholder="Nombre" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha aplicación</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Próxima dosis</label>
                  <input type="date" value={form.proximaFecha} onChange={e => setForm(p => ({ ...p, proximaFecha: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Costo ($)</label>
                  <input type="number" value={form.costo} onChange={e => setForm(p => ({ ...p, costo: e.target.value }))} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.animalId || !form.vacuna} className="px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
                {saving ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
