'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { Tarea, Animal, EstadoTarea, Prioridad, PaginatedTareas } from '@/types'

const estadoColor: Record<EstadoTarea, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  EN_PROGRESO: 'bg-blue-100 text-blue-700',
  COMPLETADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-gray-100 text-gray-500',
}
const prioridadColor: Record<Prioridad, string> = {
  ALTA: 'text-red-600', MEDIA: 'text-orange-500', BAJA: 'text-gray-400',
}
const ESTADOS: EstadoTarea[] = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA']
const PRIORIDADES: Prioridad[] = ['ALTA', 'MEDIA', 'BAJA']

export default function TareasPage() {
  const { token } = useAuth()
  const [pag, setPag] = useState<PaginatedTareas | null>(null)
  const [animales, setAnimales] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), estado: 'PENDIENTE' as EstadoTarea, prioridad: 'MEDIA' as Prioridad, animalId: '' })

  const fetchTareas = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (filtroEstado) params.set('estado', filtroEstado)
      if (filtroPrioridad) params.set('prioridad', filtroPrioridad)
      const data = await api.get<PaginatedTareas>(`/tareas?${params}`, { token })
      setPag(data)
    } finally { setLoading(false) }
  }, [token, page, filtroEstado, filtroPrioridad])

  useEffect(() => { fetchTareas() }, [fetchTareas])
  useEffect(() => {
    if (!token) return
    api.get<{ animales: Animal[] }>('/animales?limit=200', { token }).then(r => setAnimales(r.animales)).catch(console.error)
  }, [token])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      await api.post('/tareas', { ...form, animalId: form.animalId ? parseInt(form.animalId) : undefined, descripcion: form.descripcion || undefined }, { token: token! })
      setShowModal(false)
      setForm({ titulo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), estado: 'PENDIENTE', prioridad: 'MEDIA', animalId: '' })
      fetchTareas()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') } finally { setSaving(false) }
  }

  async function cambiarEstado(id: number, estado: EstadoTarea) {
    try {
      await api.patch(`/tareas/${id}`, { estado }, { token: token! })
      fetchTareas()
    } catch (e) { console.error(e) }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta tarea?')) return
    try { await api.delete(`/tareas/${id}`, { token: token! }); fetchTareas() }
    catch (e) { alert(e instanceof Error ? e.message : 'Error') }
  }

  function diasHasta(fecha: string) {
    const diff = new Date(fecha).getTime() - Date.now()
    return Math.ceil(diff / 86400000)
  }

  const pendientes = pag?.tareas.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROGRESO') ?? []

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-500 text-sm">{pag ? `${pag.total} tareas` : 'Cargando...'} · {pendientes.length} pendientes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nueva tarea</button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
        </select>
        <select value={filtroPrioridad} onChange={e => { setFiltroPrioridad(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">✅</div><p>Cargando...</p></div>
        ) : (pag?.tareas?.length ?? 0) === 0 ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">✅</div><p>No hay tareas registradas</p><p className="text-sm mt-1">Crea recordatorios para manejo sanitario, pesajes, movimientos, etc.</p></div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {pag?.tareas?.map((t: Tarea) => {
                const dias = diasHasta(t.fecha)
                const vencida = dias < 0 && t.estado === 'PENDIENTE'
                return (
                  <div key={t.id} className={`p-4 hover:bg-gray-50/50 transition-colors ${vencida ? 'border-l-4 border-red-400' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-bold text-xs ${prioridadColor[t.prioridad]}`}>● {t.prioridad}</span>
                          <h3 className={`font-medium text-sm ${t.estado === 'COMPLETADA' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.titulo}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[t.estado]}`}>{t.estado.replace('_', ' ')}</span>
                          {vencida && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Vencida</span>}
                        </div>
                        {t.descripcion && <p className="text-gray-500 text-xs mb-2">{t.descripcion}</p>}
                        <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                          <span>📅 {new Date(t.fecha).toLocaleDateString('es-CO')}</span>
                          {t.animal && <Link href={`/dashboard/animales/${t.animalId}`} className="text-green-600 hover:underline">🐄 {t.animal.nombre || t.animal.codigo}</Link>}
                          {t.usuario && <span>👤 {t.usuario.nombre}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {t.estado !== 'COMPLETADA' && t.estado !== 'CANCELADA' && (
                          <button onClick={() => cambiarEstado(t.id, 'COMPLETADA')} className="text-xs px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700">✓</button>
                        )}
                        {t.estado === 'PENDIENTE' && (
                          <button onClick={() => cambiarEstado(t.id, 'EN_PROGRESO')} className="text-xs px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700">→</button>
                        )}
                        <button onClick={() => handleDelete(t.id)} className="text-xs px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">✕</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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
              <h2 className="text-lg font-bold">Nueva tarea</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Título *</label>
                <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ej: Vacunación masiva, Pesaje mensual, Visita veterinaria" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha programada *</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Prioridad</label>
                  <select value={form.prioridad} onChange={e => setForm(p => ({ ...p, prioridad: e.target.value as Prioridad }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Animal relacionado (opcional)</label>
                <select value={form.animalId} onChange={e => setForm(p => ({ ...p, animalId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                  <option value="">Tarea general (no relacionada a un animal)</option>
                  {animales.map(a => <option key={a.id} value={a.id}>{a.nombre || a.codigo} ({a.especie})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Detalles de la tarea, instrucciones específicas..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.titulo} className="px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
                {saving ? 'Guardando...' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
