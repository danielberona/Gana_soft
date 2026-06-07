'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { Animal, Especie, Sexo, EstadoAnimal, PaginatedAnimales, Potrero } from '@/types'

const ESPECIES: Especie[] = ['BOVINO', 'PORCINO', 'OVINO', 'CAPRINO', 'EQUINO', 'AVICOLA', 'OTRO']
const ESTADOS: EstadoAnimal[] = ['ACTIVO', 'VENDIDO', 'MUERTO', 'TRANSFERIDO']
const especieEmoji: Record<Especie, string> = { BOVINO: '🐄', PORCINO: '🐷', OVINO: '🐑', CAPRINO: '🐐', EQUINO: '🐴', AVICOLA: '🐔', OTRO: '🐾' }
const estadoColor: Record<string, string> = { ACTIVO: 'bg-green-100 text-green-700', VENDIDO: 'bg-blue-100 text-blue-700', MUERTO: 'bg-red-100 text-red-700', TRANSFERIDO: 'bg-yellow-100 text-yellow-700' }

interface AnimalForm {
  codigo: string; nombre: string; especie: Especie; raza: string; sexo: Sexo
  color: string; numeroArete: string; fechaNac: string; peso: string
  estado: EstadoAnimal; observaciones: string; potreroId: string
}
const emptyForm: AnimalForm = { codigo: '', nombre: '', especie: 'BOVINO', raza: '', sexo: 'HEMBRA', color: '', numeroArete: '', fechaNac: '', peso: '', estado: 'ACTIVO', observaciones: '', potreroId: '' }

export default function AnimalesPage() {
  const { token, usuario } = useAuth()
  const [data, setData] = useState<PaginatedAnimales | null>(null)
  const [potreros, setPotreros] = useState<Potrero[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPotrero, setFiltroPotrero] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null)
  const [form, setForm] = useState<AnimalForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAnimales = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      if (filtroEspecie) params.set('especie', filtroEspecie)
      if (filtroEstado) params.set('estado', filtroEstado)
      if (filtroPotrero) params.set('potreroId', filtroPotrero)
      const res = await api.get<PaginatedAnimales>(`/animales?${params}`, { token })
      setData(res)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [token, page, search, filtroEspecie, filtroEstado, filtroPotrero])

  useEffect(() => { fetchAnimales() }, [fetchAnimales])

  useEffect(() => {
    if (!token) return
    api.get<Potrero[]>('/potreros', { token }).then(setPotreros).catch(console.error)
  }, [token])

  function openCreate() { setEditAnimal(null); setForm(emptyForm); setError(''); setShowModal(true) }
  function openEdit(a: Animal) {
    setEditAnimal(a)
    setForm({ codigo: a.codigo, nombre: a.nombre || '', especie: a.especie, raza: a.raza || '', sexo: a.sexo, color: a.color || '', numeroArete: a.numeroArete || '', fechaNac: a.fechaNac ? a.fechaNac.slice(0, 10) : '', peso: a.peso ? String(a.peso) : '', estado: a.estado, observaciones: a.observaciones || '', potreroId: a.potreroId ? String(a.potreroId) : '' })
    setError(''); setShowModal(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const payload = { ...form, peso: form.peso ? parseFloat(form.peso) : undefined, fechaNac: form.fechaNac || undefined, nombre: form.nombre || undefined, raza: form.raza || undefined, color: form.color || undefined, numeroArete: form.numeroArete || undefined, observaciones: form.observaciones || undefined, potreroId: form.potreroId ? parseInt(form.potreroId) : null }
      if (editAnimal) { await api.patch(`/animales/${editAnimal.id}`, payload, { token: token! }) }
      else { await api.post('/animales', payload, { token: token! }) }
      setShowModal(false); fetchAnimales()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al guardar') } finally { setSaving(false) }
  }

  async function handleDelete(a: Animal) {
    if (!confirm(`¿Eliminar ${a.nombre || a.codigo}? Esta acción no se puede deshacer.`)) return
    try { await api.delete(`/animales/${a.id}`, { token: token! }); fetchAnimales() }
    catch (e) { alert(e instanceof Error ? e.message : 'Error') }
  }

  function calcEdad(fechaNac?: string) {
    if (!fechaNac) return '—'
    const diff = Date.now() - new Date(fechaNac).getTime()
    const days = Math.floor(diff / 86400000)
    if (days < 30) return `${days}d`
    if (days < 365) return `${Math.floor(days / 30)}m`
    return `${Math.floor(days / 365)}a`
  }

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Animales</h1>
          <p className="text-gray-500 text-sm">{data ? `${data.total} animales registrados` : 'Cargando...'}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
          + Nuevo animal
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input type="text" placeholder="Buscar por código, nombre, arete..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
        <select value={filtroEspecie} onChange={e => { setFiltroEspecie(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todas las especies</option>
          {ESPECIES.map(e => <option key={e} value={e}>{especieEmoji[e]} {e}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filtroPotrero} onChange={e => { setFiltroPotrero(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todos los potreros</option>
          {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400"><div className="text-4xl mb-3">🐄</div><p>Cargando...</p></div>
        ) : data?.animales.length === 0 ? (
          <div className="p-16 text-center text-gray-400"><div className="text-4xl mb-3">🌾</div><p>No hay animales con esos filtros</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Código / Arete', 'Nombre', 'Especie', 'Sexo', 'Edad', 'Peso', 'Potrero', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.animales.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-medium text-gray-900">{a.codigo}</div>
                      {a.numeroArete && <div className="text-xs text-gray-400">{a.numeroArete}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{a.nombre || '—'}</td>
                    <td className="px-4 py-3 text-sm">{especieEmoji[a.especie]} {a.especie}</td>
                    <td className="px-4 py-3 text-sm">{a.sexo === 'MACHO' ? '♂' : '♀'} {a.sexo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{calcEdad(a.fechaNac)}</td>
                    <td className="px-4 py-3 text-sm">{a.peso ? `${a.peso} kg` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.potrero?.nombre || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor[a.estado]}`}>{a.estado}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Link href={`/dashboard/animales/${a.id}`} className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium">Ver</Link>
                        <button onClick={() => openEdit(a)} className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Editar</button>
                        {usuario?.rol === 'ADMIN' && <button onClick={() => handleDelete(a)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">Eliminar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Página {data.page} de {data.totalPages} · {data.total} animales</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.page === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 text-sm hover:bg-gray-50">← Anterior</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={data.page === data.totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 text-sm hover:bg-gray-50">Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editAnimal ? 'Editar animal' : 'Registrar nuevo animal'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl leading-none hover:text-gray-600">×</button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {error && <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
              {[
                { label: 'Código *', key: 'codigo', type: 'text', placeholder: 'Ej: BOV-001' },
                { label: 'Número de arete', key: 'numeroArete', type: 'text', placeholder: 'Ej: AR-12345' },
                { label: 'Nombre', key: 'nombre', type: 'text', placeholder: 'Nombre del animal' },
                { label: 'Raza', key: 'raza', type: 'text', placeholder: 'Ej: Holstein, Brahman' },
                { label: 'Color / Marcas', key: 'color', type: 'text', placeholder: 'Ej: Negro con blanco' },
                { label: 'Peso (kg)', key: 'peso', type: 'number', placeholder: '0.0' },
                { label: 'Fecha de nacimiento', key: 'fechaNac', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof AnimalForm]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Especie *</label>
                <select value={form.especie} onChange={e => setForm(prev => ({ ...prev, especie: e.target.value as Especie }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  {ESPECIES.map(e => <option key={e} value={e}>{especieEmoji[e]} {e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Sexo *</label>
                <select value={form.sexo} onChange={e => setForm(prev => ({ ...prev, sexo: e.target.value as Sexo }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="HEMBRA">♀ Hembra</option>
                  <option value="MACHO">♂ Macho</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Estado</label>
                <select value={form.estado} onChange={e => setForm(prev => ({ ...prev, estado: e.target.value as EstadoAnimal }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Potrero</label>
                <select value={form.potreroId} onChange={e => setForm(prev => ({ ...prev, potreroId: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">Sin asignar</option>
                  {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(prev => ({ ...prev, observaciones: e.target.value }))} rows={3} placeholder="Notas adicionales sobre el animal..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.codigo} className="px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
                {saving ? 'Guardando...' : editAnimal ? 'Guardar cambios' : 'Crear animal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
