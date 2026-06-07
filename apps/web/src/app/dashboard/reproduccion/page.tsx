'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { EventoReproductivo, Animal, TipoEvento, PaginatedEventos } from '@/types'

const tipoEventoLabel: Record<TipoEvento, string> = {
  CELO: 'Celo', MONTA: 'Monta', INSEMINACION: 'Inseminación', PRENEZ_CONFIRMADA: 'Preñez confirmada',
  PARTO: 'Parto', ABORTO: 'Aborto', DESTETE: 'Destete',
}
const tipoEventoColor: Record<TipoEvento, string> = {
  CELO: 'bg-red-100 text-red-700', MONTA: 'bg-blue-100 text-blue-700', INSEMINACION: 'bg-purple-100 text-purple-700',
  PRENEZ_CONFIRMADA: 'bg-pink-100 text-pink-700', PARTO: 'bg-green-100 text-green-700',
  ABORTO: 'bg-gray-100 text-gray-700', DESTETE: 'bg-yellow-100 text-yellow-700',
}
const TIPOS: TipoEvento[] = ['CELO', 'MONTA', 'INSEMINACION', 'PRENEZ_CONFIRMADA', 'PARTO', 'ABORTO', 'DESTETE']

export default function ReproduccionPage() {
  const { token } = useAuth()
  const [pag, setPag] = useState<PaginatedEventos | null>(null)
  const [animales, setAnimales] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ animalId: '', tipo: 'CELO' as TipoEvento, fecha: new Date().toISOString().slice(0, 10), descripcion: '', resultado: '' })

  const fetchEventos = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (filtroTipo) params.set('tipo', filtroTipo)
      const data = await api.get<PaginatedEventos>(`/reproduccion?${params}`, { token })
      setPag(data)
    } finally { setLoading(false) }
  }, [token, page, filtroTipo])

  useEffect(() => { fetchEventos() }, [fetchEventos])
  useEffect(() => {
    if (!token) return
    api.get<{ animales: Animal[] }>('/animales?limit=200&especie=BOVINO', { token }).then(r => setAnimales(r.animales)).catch(console.error)
  }, [token])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      await api.post('/reproduccion', {
        ...form, animalId: parseInt(form.animalId),
        descripcion: form.descripcion || undefined, resultado: form.resultado || undefined,
      }, { token: token! })
      setShowModal(false)
      setForm({ animalId: '', tipo: 'CELO', fecha: new Date().toISOString().slice(0, 10), descripcion: '', resultado: '' })
      fetchEventos()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') } finally { setSaving(false) }
  }

  const conteosPorTipo = pag ? TIPOS.map(tipo => {
    const count = pag.eventos.filter(e => e.tipo === tipo).length
    return { tipo, count }
  }).filter(x => x.count > 0) : []

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reproducción</h1>
          <p className="text-gray-500 text-sm">{pag ? `${pag.total} eventos registrados` : 'Cargando...'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nuevo evento</button>
      </div>

      <div className="flex gap-3 mb-5">
        <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todos los eventos</option>
          {TIPOS.map(t => <option key={t} value={t}>{tipoEventoLabel[t]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">🐣</div><p>Cargando...</p></div>
        ) : (pag?.eventos?.length ?? 0) === 0 ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">🐣</div><p>No hay eventos reproductivos registrados</p></div>
        ) : (
          <>
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                {['Animal', 'Evento', 'Fecha', 'Descripción', 'Resultado'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {pag?.eventos?.map((e: EventoReproductivo) => (
                  <tr key={e.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      {e.animal ? <Link href={`/dashboard/animales/${e.animalId}`} className="text-sm text-green-600 hover:underline font-medium">{e.animal.nombre || e.animal.codigo}</Link> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tipoEventoColor[e.tipo]}`}>{tipoEventoLabel[e.tipo]}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(e.fecha).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{e.descripcion || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.resultado || '—'}</td>
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
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between">
              <h2 className="text-lg font-bold">Registrar evento reproductivo</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Animal *</label>
                <select value={form.animalId} onChange={e => setForm(p => ({ ...p, animalId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                  <option value="">Seleccionar animal...</option>
                  {animales.map(a => <option key={a.id} value={a.id}>{a.nombre || a.codigo} ({a.sexo})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo de evento *</label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as TipoEvento }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                    {TIPOS.map(t => <option key={t} value={t}>{tipoEventoLabel[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Detalles del evento reproductivo..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Resultado</label>
                <input value={form.resultado} onChange={e => setForm(p => ({ ...p, resultado: e.target.value }))} placeholder="Ej: Positivo, 2 crías, Negativo..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.animalId} className="px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
                {saving ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
