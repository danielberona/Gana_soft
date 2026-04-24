'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { DashboardData, Especie, EstadoAnimal } from '@/types'
const especieEmoji: Record<Especie,string> = {BOVINO:'🐄',PORCINO:'🐷',OVINO:'🐑',CAPRINO:'🐐',EQUINO:'🐴',AVICOLA:'🐔',OTRO:'🐾'}
export default function ReportesPage() {
  const { token } = useAuth()
  const [data, setData] = useState<DashboardData|null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!token) return
    api.get<DashboardData>('/reportes/dashboard',{token}).then(setData).catch(console.error).finally(()=>setLoading(false))
  },[token])
  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="text-center text-gray-400"><div className="text-4xl mb-3">📊</div><p>Generando reportes...</p></div></div>
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">Reportes</h1><p className="text-gray-500 mt-1">Análisis de tu ganadería</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {label:'Total',value:data?.resumen.totalAnimales,icon:'🐄'},
          {label:'Activos',value:data?.resumen.animalesActivos,icon:'✅'},
          {label:'Inactivos',value:data?.resumen.animalesInactivos,icon:'⚠️'},
          {label:'Especies',value:data?.porEspecie.length,icon:'🌿'},
        ].map(({label,value,icon})=>(
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-gray-900">{value??'—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Por especie</h2>
          <div className="space-y-4">
            {data?.porEspecie.map(e=>{
              const total = data.resumen.totalAnimales||1
              const pct = Math.round((e._count.id/total)*100)
              return (
                <div key={e.especie}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{especieEmoji[e.especie]} {e.especie}</span>
                    <span className="font-bold">{e._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{width:`${pct}%`}} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Por estado</h2>
          <div className="space-y-3">
            {data?.porEstado.map(e=>{
              const total = data.resumen.totalAnimales||1
              const pct = Math.round((e._count.id/total)*100)
              return (
                <div key={e.estado} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{e.estado}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{width:`${pct}%`}} />
                  </div>
                  <span className="font-bold text-sm">{e._count.id}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}