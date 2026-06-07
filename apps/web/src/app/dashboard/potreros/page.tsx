'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { Potrero } from '@/types'

interface PotreroConAnimales extends Potrero {
  animales?: { id: number; codigo: string; nombre?: string; especie: string; sexo: string; peso?: number }[]
}

export default function PotrerosPage() {
  const { token, usuario } = useAuth()
  const [potreros, setPotreros] = useState<PotreroConAnimales[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editPotrero, setEditPotrero] = useState<Potrero | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [verAnimales, setVerAnimales] = useState<number | null>(null)
  const [form, setForm] = useState({ nombre: '', area: '', capacidad: '', descripcion: '' })

  const fetchPotreros = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<PotreroConAnimales[]>('/potreros', { token })
      setPotreros(data)
    } finally { setLoading(false) }
  }, [token])

  useEffect(() => { fetchPotreros() }, [fetchPotreros])

  async function fetchDetalle(id: number) {
    if (!token) return
    const potrero = await api.get<PotreroConAnimales>(`/potreros/${id}`, { token })
    setPotreros(prev => prev.map(p => p.id === id ? { ...p, animales: potrero.animales } : p))
    setVerAnimales(id)
  }

  function openCreate() { setEditPotrero(null); setForm({ nombre: '', area: '', capacidad: '', descripcion: '' }); setError(''); setShowModal(true) }
  function openEdit(p: Potrero) { setEditPotrero(p); setForm({ nombre: p.nombre, area: p.area ? String(p.area) : '', capacidad: p.capacidad ? String(p.capacidad) : '', descripcion: p.descripcion || '' }); setError(''); setShowModal(true) }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const payload = { nombre: form.nombre, area: form.area ? parseFloat(form.area) : undefined, capacidad: form.capacidad ? parseInt(form.capacidad) : undefined, descripcion: form.descripcion || undefined }
      if (editPotrero) { await api.patch(`/potreros/${editPotrero.id}`, payload, { token: token! }) }
      else { await api.post('/potreros', payload, { token: token! }) }
      setShowModal(false); fetchPotreros()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') } finally { setSaving(false) }
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar potrero "${nombre}"?`)) return
    try { await api.delete(`/potreros/${id}`, { token: token! }); fetchPotreros() }
    catch (e) { alert(e instanceof Error ? e.message : 'Error') }
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Potreros</h1>
          <p className="text-gray-500 text-sm">{potreros.length} lotes/potreros registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nuevo potrero</button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">🌿</div><p>Cargando...</p></div>
      ) : potreros.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
          <div className="text-4xl mb-2">🌿</div>
          <p>No hay potreros registrados</p>
          <p className="text-sm mt-1">Los potreros te permiten ubicar y agrupar tu ganado por lotes o praderas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {potreros.map(p => {
            const ocupacion = p.capacidad && p._count ? Math.round((p._count.animales / p.capacidad) * 100) : null
            const expanded = verAnimales === p.id
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{p.nombre}</h3>
                      {!p.activo && <span className="text-xs text-gray-400">(Inactivo)</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">Editar</button>
                      {usuario?.rol === 'ADMIN' && <button onClick={() => handleDelete(p.id, p.nombre)} className="text-xs px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">Eliminar</button>}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {p.area && <div className="flex justify-between"><span>📐 Área</span><span className="font-medium">{p.area} ha</span></div>}
                    <div className="flex justify-between">
                      <span>🐄 Animales activos</span>
                      <span className="font-medium">{p._count?.animales ?? 0}{p.capacidad ? ` / ${p.capacidad}` : ''}</span>
                    </div>
                    {p.descripcion && <p className="text-xs text-gray-400 mt-1">{p.descripcion}</p>}
                  </div>

                  {ocupacion !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Ocupación</span>
                        <span className={`font-medium ${ocupacion > 90 ? 'text-red-600' : ocupacion > 70 ? 'text-orange-500' : 'text-green-600'}`}>{ocupacion}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${ocupacion > 90 ? 'bg-red-500' : ocupacion > 70 ? 'bg-orange-400' : 'bg-green-500'}`} style={{ width: `${Math.min(100, ocupacion)}%` }} />
                      </div>
                    </div>
                  )}

                  <button onClick={() => expanded ? setVerAnimales(null) : fetchDetalle(p.id)} className="w-full text-sm text-green-600 hover:text-green-700 font-medium py-1 border border-green-200 rounded-xl hover:bg-green-50 transition">
                    {expanded ? 'Ocultar animales ↑' : 'Ver animales ↓'}
                  </button>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    {(p.animales?.length ?? 0) === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-2">Sin animales activos en este potrero</p>
                    ) : (
                      <div className="space-y-2">
                        {p.animales?.map(a => (
                          <div key={a.id} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 font-mono text-xs">{a.codigo}</span>
                            <span className="text-gray-700 flex-1">{a.nombre || a.codigo}</span>
                            <span className="text-xs text-gray-400">{a.peso ? `${a.peso}kg` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between">
              <h2 className="text-lg font-bold">{editPotrero ? 'Editar potrero' : 'Nuevo potrero'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Potrero 1, La Pradera, Lote Norte" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Área (hectáreas)</label>
                  <input type="number" step="0.1" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} placeholder="0.0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Capacidad (animales)</label>
                  <input type="number" value={form.capacidad} onChange={e => setForm(p => ({ ...p, capacidad: e.target.value }))} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={2} placeholder="Tipo de pasto, ubicación, etc." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.nombre} className="px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
                {saving ? 'Guardando...' : editPotrero ? 'Guardar cambios' : 'Crear potrero'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
