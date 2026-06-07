'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { Animal, RegistroSalud, Produccion, Vacunacion, EventoReproductivo, PesajeHistorial } from '@/types'

const especieEmoji: Record<string, string> = { BOVINO: '🐄', PORCINO: '🐷', OVINO: '🐑', CAPRINO: '🐐', EQUINO: '🐴', AVICOLA: '🐔', OTRO: '🐾' }
const estadoColor: Record<string, string> = { ACTIVO: 'bg-green-100 text-green-700', VENDIDO: 'bg-blue-100 text-blue-700', MUERTO: 'bg-red-100 text-red-700', TRANSFERIDO: 'bg-yellow-100 text-yellow-700' }
const tipoEventoLabel: Record<string, string> = { CELO: '🔴 Celo', MONTA: '♂ Monta', INSEMINACION: '💉 Inseminación', PRENEZ_CONFIRMADA: '🤰 Preñez confirmada', PARTO: '🐣 Parto', ABORTO: '❌ Aborto', DESTETE: '🍼 Destete' }

type Tab = 'info' | 'salud' | 'vacunas' | 'produccion' | 'reproduccion' | 'pesajes'

export default function AnimalDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [showSaludForm, setShowSaludForm] = useState(false)
  const [showPesajeForm, setShowPesajeForm] = useState(false)
  const [showVacunaForm, setShowVacunaForm] = useState(false)
  const [showProduccionForm, setShowProduccionForm] = useState(false)
  const [showReproduccionForm, setShowReproduccionForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [saludForm, setSaludForm] = useState({ tipo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), veterinario: '', costo: '' })
  const [pesajeForm, setPesajeForm] = useState({ peso: '', fecha: new Date().toISOString().slice(0, 10), observaciones: '' })
  const [vacunaForm, setVacunaForm] = useState({ vacuna: '', dosis: '', lote: '', fecha: new Date().toISOString().slice(0, 10), proximaDosis: '', veterinario: '', costo: '' })
  const [produccionForm, setProduccionForm] = useState({ tipo: 'Leche', cantidad: '', unidad: 'litros', fecha: new Date().toISOString().slice(0, 10) })
  const [reproduccionForm, setReproduccionForm] = useState({ tipo: 'CELO' as string, fecha: new Date().toISOString().slice(0, 10), observaciones: '', resultado: '' })

  useEffect(() => {
    if (!token || !id) return
    api.get<Animal>(`/animales/${id}`, { token }).then(setAnimal).catch(console.error).finally(() => setLoading(false))
  }, [token, id])

  async function guardarSalud() {
    if (!animal) return
    setSaving(true)
    try {
      await api.post('/produccion/salud', { ...saludForm, animalId: animal.id, costo: saludForm.costo ? parseFloat(saludForm.costo) : undefined }, { token: token! })
      const updated = await api.get<Animal>(`/animales/${id}`, { token: token! })
      setAnimal(updated); setShowSaludForm(false)
      setSaludForm({ tipo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), veterinario: '', costo: '' })
    } finally { setSaving(false) }
  }

  async function guardarPesaje() {
    if (!animal) return
    setSaving(true)
    try {
      await api.post('/pesajes', { animalId: animal.id, peso: parseFloat(pesajeForm.peso), fecha: pesajeForm.fecha, observaciones: pesajeForm.observaciones || undefined }, { token: token! })
      const updated = await api.get<Animal>(`/animales/${id}`, { token: token! })
      setAnimal(updated); setShowPesajeForm(false)
      setPesajeForm({ peso: '', fecha: new Date().toISOString().slice(0, 10), observaciones: '' })
    } finally { setSaving(false) }
  }

  async function guardarVacuna() {
    if (!animal) return
    setSaving(true)
    try {
      await api.post('/vacunaciones', { ...vacunaForm, animalId: animal.id, costo: vacunaForm.costo ? parseFloat(vacunaForm.costo) : undefined, proximaDosis: vacunaForm.proximaDosis || undefined }, { token: token! })
      const updated = await api.get<Animal>(`/animales/${id}`, { token: token! })
      setAnimal(updated); setShowVacunaForm(false)
    } finally { setSaving(false) }
  }

  async function guardarProduccion() {
    if (!animal) return
    setSaving(true)
    try {
      await api.post('/produccion', { ...produccionForm, animalId: animal.id, cantidad: parseFloat(produccionForm.cantidad) }, { token: token! })
      const updated = await api.get<Animal>(`/animales/${id}`, { token: token! })
      setAnimal(updated); setShowProduccionForm(false)
    } finally { setSaving(false) }
  }

  async function guardarReproduccion() {
    if (!animal) return
    setSaving(true)
    try {
      await api.post('/reproduccion', { ...reproduccionForm, animalId: animal.id }, { token: token! })
      const updated = await api.get<Animal>(`/animales/${id}`, { token: token! })
      setAnimal(updated); setShowReproduccionForm(false)
    } finally { setSaving(false) }
  }

  function calcEdad(fechaNac?: string) {
    if (!fechaNac) return null
    const diff = Date.now() - new Date(fechaNac).getTime()
    const years = Math.floor(diff / (365.25 * 86400000))
    const months = Math.floor((diff % (365.25 * 86400000)) / (30 * 86400000))
    if (years > 0) return `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`
    return `${months} mes${months !== 1 ? 'es' : ''}`
  }

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="text-center text-gray-400"><div className="text-4xl mb-3">🐄</div><p>Cargando animal...</p></div></div>
  if (!animal) return <div className="p-8"><div className="text-center text-gray-400"><p>Animal no encontrado</p><Link href="/dashboard/animales" className="text-green-600 hover:underline mt-2 inline-block">← Volver</Link></div></div>

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'info', label: 'Información', icon: '📋' },
    { key: 'salud', label: 'Salud', icon: '🏥', count: animal.registros?.length },
    { key: 'vacunas', label: 'Vacunas', icon: '💉', count: animal.vacunaciones?.length },
    { key: 'produccion', label: 'Producción', icon: '🥛', count: animal.producciones?.length },
    { key: 'reproduccion', label: 'Reproducción', icon: '🐣', count: animal.eventosReproductivos?.length },
    { key: 'pesajes', label: 'Pesajes', icon: '⚖️', count: animal.pesajes?.length },
  ]

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-5">
        <Link href="/dashboard/animales" className="text-sm text-gray-500 hover:text-green-600 mb-3 inline-flex items-center gap-1">← Volver a animales</Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{especieEmoji[animal.especie]}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{animal.nombre || animal.codigo}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-500 text-sm font-mono">{animal.codigo}</span>
                {animal.numeroArete && <span className="text-gray-400 text-sm">· Arete: {animal.numeroArete}</span>}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColor[animal.estado]}`}>{animal.estado}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{animal.especie} · {animal.sexo === 'MACHO' ? '♂ Macho' : '♀ Hembra'}</p>
            {animal.potrero && <p className="text-green-600">📍 {animal.potrero.nombre}</p>}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Raza', value: animal.raza || '—' },
          { label: 'Peso actual', value: animal.peso ? `${animal.peso} kg` : '—' },
          { label: 'Edad', value: calcEdad(animal.fechaNac) || '—' },
          { label: 'Color', value: animal.color || '—' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
            <p className="font-semibold text-gray-800 text-sm">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label} {t.count !== undefined && t.count > 0 && <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {activeTab === 'info' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Datos del animal</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Código interno', value: animal.codigo },
                { label: 'Número de arete', value: animal.numeroArete || '—' },
                { label: 'Nombre', value: animal.nombre || '—' },
                { label: 'Especie', value: `${especieEmoji[animal.especie]} ${animal.especie}` },
                { label: 'Raza', value: animal.raza || '—' },
                { label: 'Sexo', value: animal.sexo === 'MACHO' ? '♂ Macho' : '♀ Hembra' },
                { label: 'Color / Marcas', value: animal.color || '—' },
                { label: 'Fecha nacimiento', value: animal.fechaNac ? new Date(animal.fechaNac).toLocaleDateString('es-CO') : '—' },
                { label: 'Peso registrado', value: animal.peso ? `${animal.peso} kg` : '—' },
                { label: 'Estado', value: animal.estado },
                { label: 'Potrero', value: animal.potrero?.nombre || '—' },
                { label: 'Registrado por', value: animal.usuario?.nombre || '—' },
              ].map(f => (
                <div key={f.label} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                  <p className="font-medium text-gray-800">{f.value}</p>
                </div>
              ))}
            </div>
            {(animal.padre || animal.madre) && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">Genealogía</h4>
                <div className="grid grid-cols-2 gap-3">
                  {animal.padre && (
                    <Link href={`/dashboard/animales/${animal.padre.id}`} className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                      <p className="text-xs text-blue-400 mb-0.5">♂ Padre</p>
                      <p className="font-medium text-blue-700">{animal.padre.nombre || animal.padre.codigo}</p>
                    </Link>
                  )}
                  {animal.madre && (
                    <Link href={`/dashboard/animales/${animal.madre.id}`} className="p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition">
                      <p className="text-xs text-pink-400 mb-0.5">♀ Madre</p>
                      <p className="font-medium text-pink-700">{animal.madre.nombre || animal.madre.codigo}</p>
                    </Link>
                  )}
                </div>
              </div>
            )}
            {animal.observaciones && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">Observaciones</h4>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">{animal.observaciones}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'salud' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Registros de salud</h3>
              <button onClick={() => setShowSaludForm(!showSaludForm)} className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nuevo registro</button>
            </div>
            {showSaludForm && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tipo *</label><input value={saludForm.tipo} onChange={e => setSaludForm(p => ({ ...p, tipo: e.target.value }))} placeholder="Ej: Consulta, Tratamiento, Cirugía" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Fecha</label><input type="date" value={saludForm.fecha} onChange={e => setSaludForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Veterinario</label><input value={saludForm.veterinario} onChange={e => setSaludForm(p => ({ ...p, veterinario: e.target.value }))} placeholder="Nombre del veterinario" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Costo ($)</label><input type="number" value={saludForm.costo} onChange={e => setSaludForm(p => ({ ...p, costo: e.target.value }))} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div className="col-span-2"><label className="text-xs font-medium text-gray-600 mb-1 block">Descripción *</label><textarea value={saludForm.descripcion} onChange={e => setSaludForm(p => ({ ...p, descripcion: e.target.value }))} rows={2} placeholder="Descripción del procedimiento o diagnóstico" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" /></div>
                </div>
                <div className="flex gap-2"><button onClick={guardarSalud} disabled={saving || !saludForm.tipo || !saludForm.descripcion} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60" style={{ background: '#35933a' }}>{saving ? 'Guardando...' : 'Guardar'}</button><button onClick={() => setShowSaludForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancelar</button></div>
              </div>
            )}
            {(animal.registros?.length ?? 0) === 0 ? <p className="text-gray-400 text-center py-8">Sin registros de salud</p> : (
              <div className="space-y-3">
                {animal.registros?.map((r: RegistroSalud) => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-blue-400">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-800 text-sm">{r.tipo}</span>
                      <span className="text-xs text-gray-400">{new Date(r.fecha).toLocaleDateString('es-CO')}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{r.descripcion}</p>
                    <div className="flex gap-3 text-xs text-gray-400">
                      {r.veterinario && <span>👨‍⚕️ {r.veterinario}</span>}
                      {r.costo != null && <span>💰 ${r.costo.toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vacunas' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Vacunaciones</h3>
              <button onClick={() => setShowVacunaForm(!showVacunaForm)} className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nueva vacuna</button>
            </div>
            {showVacunaForm && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Vacuna *</label><input value={vacunaForm.vacuna} onChange={e => setVacunaForm(p => ({ ...p, vacuna: e.target.value }))} placeholder="Ej: Brucelosis, Aftosa" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Dosis</label><input value={vacunaForm.dosis} onChange={e => setVacunaForm(p => ({ ...p, dosis: e.target.value }))} placeholder="Ej: 2ml" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Lote</label><input value={vacunaForm.lote} onChange={e => setVacunaForm(p => ({ ...p, lote: e.target.value }))} placeholder="Número de lote" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Veterinario</label><input value={vacunaForm.veterinario} onChange={e => setVacunaForm(p => ({ ...p, veterinario: e.target.value }))} placeholder="Nombre" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Fecha aplicación</label><input type="date" value={vacunaForm.fecha} onChange={e => setVacunaForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Próxima dosis</label><input type="date" value={vacunaForm.proximaDosis} onChange={e => setVacunaForm(p => ({ ...p, proximaDosis: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Costo ($)</label><input type="number" value={vacunaForm.costo} onChange={e => setVacunaForm(p => ({ ...p, costo: e.target.value }))} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                </div>
                <div className="flex gap-2"><button onClick={guardarVacuna} disabled={saving || !vacunaForm.vacuna} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60" style={{ background: '#35933a' }}>{saving ? 'Guardando...' : 'Guardar'}</button><button onClick={() => setShowVacunaForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancelar</button></div>
              </div>
            )}
            {(animal.vacunaciones?.length ?? 0) === 0 ? <p className="text-gray-400 text-center py-8">Sin vacunaciones registradas</p> : (
              <div className="space-y-3">
                {animal.vacunaciones?.map((v: Vacunacion) => (
                  <div key={v.id} className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-400">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-800 text-sm">💉 {v.vacuna}</span>
                      <span className="text-xs text-gray-400">{new Date(v.fecha).toLocaleDateString('es-CO')}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                      {v.dosis && <span>Dosis: {v.dosis}</span>}
                      {v.lote && <span>Lote: {v.lote}</span>}
                      {v.veterinario && <span>👨‍⚕️ {v.veterinario}</span>}
                      {v.costo != null && <span>💰 ${v.costo.toLocaleString()}</span>}
                      {v.proximaDosis && <span className="text-orange-600 font-medium">🔔 Próxima: {new Date(v.proximaDosis).toLocaleDateString('es-CO')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'produccion' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Registros de producción</h3>
              <button onClick={() => setShowProduccionForm(!showProduccionForm)} className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nuevo registro</button>
            </div>
            {showProduccionForm && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tipo</label>
                    <select value={produccionForm.tipo} onChange={e => setProduccionForm(p => ({ ...p, tipo: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      {['Leche', 'Carne', 'Huevos', 'Lana', 'Crías', 'Otro'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Cantidad *</label><input type="number" value={produccionForm.cantidad} onChange={e => setProduccionForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Unidad</label><input value={produccionForm.unidad} onChange={e => setProduccionForm(p => ({ ...p, unidad: e.target.value }))} placeholder="litros, kg, unidades" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Fecha</label><input type="date" value={produccionForm.fecha} onChange={e => setProduccionForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                </div>
                <div className="flex gap-2"><button onClick={guardarProduccion} disabled={saving || !produccionForm.cantidad} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60" style={{ background: '#35933a' }}>{saving ? 'Guardando...' : 'Guardar'}</button><button onClick={() => setShowProduccionForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancelar</button></div>
              </div>
            )}
            {(animal.producciones?.length ?? 0) === 0 ? <p className="text-gray-400 text-center py-8">Sin registros de producción</p> : (
              <div className="space-y-2">
                {animal.producciones?.map((p: Produccion) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl">🥛</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 text-sm">{p.tipo}</span>
                      <span className="text-gray-500 text-sm ml-2">{p.cantidad} {p.unidad}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(p.fecha).toLocaleDateString('es-CO')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reproduccion' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Eventos reproductivos</h3>
              <button onClick={() => setShowReproduccionForm(!showReproduccionForm)} className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Nuevo evento</button>
            </div>
            {showReproduccionForm && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de evento *</label>
                    <select value={reproduccionForm.tipo} onChange={e => setReproduccionForm(p => ({ ...p, tipo: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      {['CELO', 'MONTA', 'INSEMINACION', 'PRENEZ_CONFIRMADA', 'PARTO', 'ABORTO', 'DESTETE'].map(t => <option key={t} value={t}>{tipoEventoLabel[t] || t}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Fecha</label><input type="date" value={reproduccionForm.fecha} onChange={e => setReproduccionForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div className="col-span-2"><label className="text-xs font-medium text-gray-600 mb-1 block">Observaciones</label><textarea value={reproduccionForm.observaciones} onChange={e => setReproduccionForm(p => ({ ...p, observaciones: e.target.value }))} rows={2} placeholder="Detalles del evento..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" /></div>
                  <div className="col-span-2"><label className="text-xs font-medium text-gray-600 mb-1 block">Resultado</label><input value={reproduccionForm.resultado} onChange={e => setReproduccionForm(p => ({ ...p, resultado: e.target.value }))} placeholder="Ej: Positivo, 2 crías, etc." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                </div>
                <div className="flex gap-2"><button onClick={guardarReproduccion} disabled={saving} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60" style={{ background: '#35933a' }}>{saving ? 'Guardando...' : 'Guardar'}</button><button onClick={() => setShowReproduccionForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancelar</button></div>
              </div>
            )}
            {(animal.eventosReproductivos?.length ?? 0) === 0 ? <p className="text-gray-400 text-center py-8">Sin eventos reproductivos</p> : (
              <div className="space-y-3">
                {animal.eventosReproductivos?.map((e: EventoReproductivo) => (
                  <div key={e.id} className="p-4 bg-pink-50 rounded-xl border-l-4 border-pink-400">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-800 text-sm">{tipoEventoLabel[e.tipo] || e.tipo}</span>
                      <span className="text-xs text-gray-400">{new Date(e.fecha).toLocaleDateString('es-CO')}</span>
                    </div>
                    {e.observaciones && <p className="text-gray-600 text-sm mb-1">{e.observaciones}</p>}
                    {e.resultado && <p className="text-xs text-green-600 font-medium">Resultado: {e.resultado}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pesajes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Historial de pesajes</h3>
              <button onClick={() => setShowPesajeForm(!showPesajeForm)} className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Registrar peso</button>
            </div>
            {showPesajeForm && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Peso (kg) *</label><input type="number" step="0.1" value={pesajeForm.peso} onChange={e => setPesajeForm(p => ({ ...p, peso: e.target.value }))} placeholder="0.0" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 mb-1 block">Fecha</label><input type="date" value={pesajeForm.fecha} onChange={e => setPesajeForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div className="col-span-2"><label className="text-xs font-medium text-gray-600 mb-1 block">Observaciones</label><input value={pesajeForm.observaciones} onChange={e => setPesajeForm(p => ({ ...p, observaciones: e.target.value }))} placeholder="Notas del pesaje" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                </div>
                <div className="flex gap-2"><button onClick={guardarPesaje} disabled={saving || !pesajeForm.peso} className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60" style={{ background: '#35933a' }}>{saving ? 'Guardando...' : 'Guardar'}</button><button onClick={() => setShowPesajeForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancelar</button></div>
              </div>
            )}
            {(animal.pesajes?.length ?? 0) === 0 ? <p className="text-gray-400 text-center py-8">Sin pesajes registrados</p> : (
              <div>
                <div className="space-y-2 mb-4">
                  {animal.pesajes?.map((p: PesajeHistorial, i: number) => {
                    const prev = animal.pesajes?.[i + 1]
                    const diff = prev ? p.peso - prev.peso : null
                    return (
                      <div key={p.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <span className="text-xl">⚖️</span>
                        <div className="flex-1">
                          <span className="font-bold text-gray-900">{p.peso} kg</span>
                          {diff !== null && <span className={`ml-2 text-xs font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>{diff >= 0 ? '+' : ''}{diff.toFixed(1)} kg</span>}
                          {p.observaciones && <p className="text-xs text-gray-400 mt-0.5">{p.observaciones}</p>}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(p.fecha).toLocaleDateString('es-CO')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
