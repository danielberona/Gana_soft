'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { RegistroSalud, Animal } from '@/types'

const tiposComunes = ['Consulta', 'Vacunación', 'Tratamiento', 'Cirugía', 'Desparasitación', 'Diagnóstico', 'Control', 'Otro']

interface Paginado { registros: RegistroSalud[]; total: number; page: number; totalPages: number }

export default function SaludPage() {
  const { token } = useAuth()
  const [pag, setPag] = useState<Paginado | null>(null)
  const [animales, setAnimales] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ animalId: '', tipo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), veterinario: '', costo: '' })

  const fetchRegistros = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/produccion/salud?limit=15&page=${page}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (Array.isArray(data)) {
        setPag({ registros: data, total: data.length, page: 1, totalPages: 1 })
      } else {
        setPag(data)
      }
    } finally { setLoading(false) }
  }, [token, page])

  useEffect(() => { fetchRegistros() }, [fetchRegistros])
  useEffect(() => {
    if (!token) return
    api.get<{ animales: Animal[] }>('/animales?limit=200', { token }).then(r => setAnimales(r.animales)).catch(console.error)
  }, [token])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      await api.post('/produccion/salud', { ...form, animalId: parseInt(form.animalId), costo: form.costo ? parseFloat(form.costo) : undefined }, { token: token! })
      setShowModal(false)
      setForm({ animalId: '', tipo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), veterinario: '', costo: '' })
      fetchRegistros()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') } finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registros de Salud</h1>
          <p className="text-gray-500 text-sm">{pag ? `${pag.total} registros` : 'Cargando...'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nuevo registro</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">🏥</div><p>Cargando...</p></div>
        ) : (pag?.registros?.length ?? 0) === 0 ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">🏥</div><p>No hay registros de salud</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pag?.registros?.map(r => (
              <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{r.tipo}</span>
                      <span className="text-xs text-gray-400">·</span>
                      {r.animal && (
                        <Link href={`/dashboard/animales/${r.animalId}`} className="text-xs text-green-600 hover:underline font-medium">
                          {r.animal.nombre || r.animal.codigo}
                        </Link>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{r.descripcion}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      {r.veterinario && <span>👨‍⚕️ {r.veterinario}</span>}
                      {r.costo != null && <span>💰 ${r.costo.toLocaleString()}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(r.fecha).toLocaleDateString('es-CO')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {pag && pag.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-gray-500">Página {pag.page} de {pag.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pag.page === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">← Anterior</button>
              <button onClick={() => setPage(p => Math.min(pag.totalPages, p + 1))} disabled={pag.page === pag.totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between">
              <h2 className="text-lg font-bold">Nuevo registro de salud</h2>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                    <option value="">Seleccionar...</option>
                    {tiposComunes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Veterinario</label>
                  <input value={form.veterinario} onChange={e => setForm(p => ({ ...p, veterinario: e.target.value }))} placeholder="Nombre del veterinario" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Costo ($)</label>
                  <input type="number" value={form.costo} onChange={e => setForm(p => ({ ...p, costo: e.target.value }))} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción *</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Diagnóstico, medicamentos aplicados, procedimiento realizado..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.animalId || !form.tipo || !form.descripcion} className="px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
