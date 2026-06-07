'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { Produccion, Animal } from '@/types'

const tiposProduccion = ['Leche', 'Carne', 'Huevos', 'Lana', 'Crías', 'Miel', 'Otro']
const unidades: Record<string, string[]> = {
  Leche: ['litros'], Carne: ['kg'], Huevos: ['unidades', 'docenas'], Lana: ['kg'],
  Crías: ['unidades'], Miel: ['kg', 'litros'], Otro: ['kg', 'litros', 'unidades'],
}

export default function ProduccionPage() {
  const { token } = useAuth()
  const [producciones, setProducciones] = useState<Produccion[]>([])
  const [animales, setAnimales] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [form, setForm] = useState({ animalId: '', tipo: 'Leche', cantidad: '', unidad: 'litros', fecha: new Date().toISOString().slice(0, 10) })

  const fetchProducciones = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (filtroTipo) params.set('tipo', filtroTipo)
      const data = await api.get<Produccion[]>(`/produccion?${params}`, { token })
      setProducciones(data)
    } finally { setLoading(false) }
  }, [token, filtroTipo])

  useEffect(() => { fetchProducciones() }, [fetchProducciones])
  useEffect(() => {
    if (!token) return
    api.get<{ animales: Animal[] }>('/animales?limit=200', { token }).then(r => setAnimales(r.animales)).catch(console.error)
  }, [token])

  async function handleSave() {
    setSaving(true)
    try {
      await api.post('/produccion', { ...form, animalId: parseInt(form.animalId), cantidad: parseFloat(form.cantidad) }, { token: token! })
      setShowModal(false)
      setForm({ animalId: '', tipo: 'Leche', cantidad: '', unidad: 'litros', fecha: new Date().toISOString().slice(0, 10) })
      fetchProducciones()
    } finally { setSaving(false) }
  }

  const totalPorTipo = producciones.reduce((acc, p) => {
    const key = `${p.tipo} (${p.unidad})`
    acc[key] = (acc[key] || 0) + p.cantidad
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Producción</h1>
          <p className="text-gray-500 text-sm">{producciones.length} registros recientes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>+ Registrar producción</button>
      </div>

      {/* Resumen */}
      {Object.keys(totalPorTipo).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Object.entries(totalPorTipo).map(([tipo, total]) => (
            <div key={tipo} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{tipo}</p>
              <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todos los tipos</option>
          {tiposProduccion.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">🥛</div><p>Cargando...</p></div>
        ) : producciones.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">🥛</div><p>Sin registros de producción</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              {['Animal', 'Tipo', 'Cantidad', 'Fecha'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {producciones.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    {p.animal ? <Link href={`/dashboard/animales/${p.animalId}`} className="text-sm text-green-600 hover:underline font-medium">{p.animal.nombre || p.animal.codigo}</Link> : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">🥛 {p.tipo}</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.cantidad} {p.unidad}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(p.fecha).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between">
              <h2 className="text-lg font-bold">Registrar producción</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
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
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value, unidad: unidades[e.target.value]?.[0] || 'kg' }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                    {tiposProduccion.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Unidad</label>
                  <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                    {(unidades[form.tipo] || ['kg', 'litros', 'unidades']).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Cantidad *</label>
                  <input type="number" step="0.1" value={form.cantidad} onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.animalId || !form.cantidad} className="px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#35933a,#27762c)' }}>
                {saving ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
