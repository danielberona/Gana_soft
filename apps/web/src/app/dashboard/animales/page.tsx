'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { Animal, Especie, Sexo, EstadoAnimal, PaginatedAnimales } from '@/types'
const ESPECIES: Especie[] = ['BOVINO','PORCINO','OVINO','CAPRINO','EQUINO','AVICOLA','OTRO']
const ESTADOS: EstadoAnimal[] = ['ACTIVO','VENDIDO','MUERTO','TRANSFERIDO']
const especieEmoji: Record<Especie,string> = {BOVINO:'🐄',PORCINO:'🐷',OVINO:'🐑',CAPRINO:'🐐',EQUINO:'🐴',AVICOLA:'🐔',OTRO:'🐾'}
interface AnimalForm { codigo:string;nombre:string;especie:Especie;raza:string;sexo:Sexo;fechaNac:string;peso:string;estado:EstadoAnimal;observaciones:string }
const emptyForm: AnimalForm = {codigo:'',nombre:'',especie:'BOVINO',raza:'',sexo:'HEMBRA',fechaNac:'',peso:'',estado:'ACTIVO',observaciones:''}
export default function AnimalesPage() {
  const { token, usuario } = useAuth()
  const [data, setData] = useState<PaginatedAnimales|null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editAnimal, setEditAnimal] = useState<Animal|null>(null)
  const [form, setForm] = useState<AnimalForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fetchAnimales = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({page:String(page),limit:'15'})
      if (search) params.set('search',search)
      if (filtroEspecie) params.set('especie',filtroEspecie)
      if (filtroEstado) params.set('estado',filtroEstado)
      const res = await api.get<PaginatedAnimales>(`/animales?${params}`,{token})
      setData(res)
    } catch(e){console.error(e)} finally{setLoading(false)}
  },[token,page,search,filtroEspecie,filtroEstado])
  useEffect(()=>{fetchAnimales()},[fetchAnimales])
  function openCreate(){setEditAnimal(null);setForm(emptyForm);setError('');setShowModal(true)}
  function openEdit(a:Animal){
    setEditAnimal(a)
    setForm({codigo:a.codigo,nombre:a.nombre||'',especie:a.especie,raza:a.raza||'',sexo:a.sexo,fechaNac:a.fechaNac?a.fechaNac.slice(0,10):'',peso:a.peso?String(a.peso):'',estado:a.estado,observaciones:a.observaciones||''})
    setError('');setShowModal(true)
  }
  async function handleSave(){
    setSaving(true);setError('')
    try {
      const payload={...form,peso:form.peso?parseFloat(form.peso):undefined,fechaNac:form.fechaNac||undefined,nombre:form.nombre||undefined,raza:form.raza||undefined,observaciones:form.observaciones||undefined}
      if(editAnimal){await api.patch(`/animales/${editAnimal.id}`,payload,{token:token!})}
      else{await api.post('/animales',payload,{token:token!})}
      setShowModal(false);fetchAnimales()
    } catch(e){setError(e instanceof Error?e.message:'Error al guardar')} finally{setSaving(false)}
  }
  async function handleDelete(a:Animal){
    if(!confirm(`Eliminar ${a.nombre||a.codigo}?`))return
    try{await api.delete(`/animales/${a.id}`,{token:token!});fetchAnimales()}
    catch(e){alert(e instanceof Error?e.message:'Error')}
  }
  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Animales</h1><p className="text-gray-500 mt-1">{data?`${data.total} animales`:'Cargando...'}</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium" style={{background:'linear-gradient(135deg,#35933a,#27762c)'}}>+ Nuevo animal</button>
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="text" placeholder="Buscar..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
        <select value={filtroEspecie} onChange={e=>{setFiltroEspecie(e.target.value);setPage(1)}} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todas las especies</option>
          {ESPECIES.map(e=><option key={e} value={e}>{especieEmoji[e]} {e}</option>)}
        </select>
        <select value={filtroEstado} onChange={e=>{setFiltroEstado(e.target.value);setPage(1)}} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading?<div className="p-16 text-center text-gray-400"><div className="text-4xl mb-3">🐄</div><p>Cargando...</p></div>:data?.animales.length===0?<div className="p-16 text-center text-gray-400"><div className="text-4xl mb-3">🌾</div><p>No hay animales</p></div>:(
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">{['Código','Nombre','Especie','Sexo','Peso','Estado','Acciones'].map(h=><th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {data?.animales.map(a=>(
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-mono text-sm font-medium">{a.codigo}</td>
                  <td className="px-5 py-4 text-sm">{a.nombre||'—'}</td>
                  <td className="px-5 py-4 text-sm">{especieEmoji[a.especie]} {a.especie}</td>
                  <td className="px-5 py-4 text-sm">{a.sexo}</td>
                  <td className="px-5 py-4 text-sm">{a.peso?`${a.peso} kg`:'—'}</td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{a.estado}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(a)} className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">Editar</button>
                      {usuario?.rol==='ADMIN'&&<button onClick={()=>handleDelete(a)} className="text-sm px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">Eliminar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data&&data.totalPages>1&&(
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Página {data.page} de {data.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={data.page===1} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">← Anterior</button>
              <button onClick={()=>setPage(p=>Math.min(data.totalPages,p+1))} disabled={data.page===data.totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Siguiente →</button>
            </div>
          </div>
        )}
      </div>
      {showModal&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editAnimal?'Editar animal':'Nuevo animal'}</h2>
              <button onClick={()=>setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="px-7 py-6 grid grid-cols-2 gap-5">
              {error&&<div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
              {[{label:'Código *',key:'codigo',type:'text'},{label:'Nombre',key:'nombre',type:'text'},{label:'Raza',key:'raza',type:'text'},{label:'Peso (kg)',key:'peso',type:'number'},{label:'Fecha nacimiento',key:'fechaNac',type:'date'}].map(f=>(
                <div key={f.key}><label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label><input type={f.type} value={form[f.key as keyof AnimalForm]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" /></div>
              ))}
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Especie *</label><select value={form.especie} onChange={e=>setForm(prev=>({...prev,especie:e.target.value as Especie}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">{ESPECIES.map(e=><option key={e} value={e}>{especieEmoji[e]} {e}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Sexo *</label><select value={form.sexo} onChange={e=>setForm(prev=>({...prev,sexo:e.target.value as Sexo}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"><option value="HEMBRA">Hembra</option><option value="MACHO">Macho</option></select></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Estado</label><select value={form.estado} onChange={e=>setForm(prev=>({...prev,estado:e.target.value as EstadoAnimal}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">{ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}</select></div>
              <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1.5">Observaciones</label><textarea value={form.observaciones} onChange={e=>setForm(prev=>({...prev,observaciones:e.target.value}))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none" /></div>
            </div>
            <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={()=>setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancelar</button>
              <button onClick={handleSave} disabled={saving||!form.codigo} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{background:'linear-gradient(135deg,#35933a,#27762c)'}}>{saving?'Guardando...':editAnimal?'Guardar cambios':'Crear animal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}