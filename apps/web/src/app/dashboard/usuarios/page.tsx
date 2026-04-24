'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { Usuario, Rol } from '@/types'
interface UsuarioForm { nombre:string;email:string;password:string;rol:Rol;activo:boolean }
const emptyForm: UsuarioForm = {nombre:'',email:'',password:'',rol:'EMPLEADO',activo:true}
export default function UsuariosPage() {
  const { token, usuario: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUsuario, setEditUsuario] = useState<Usuario|null>(null)
  const [form, setForm] = useState<UsuarioForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fetchUsuarios = useCallback(async()=>{
    if(!token)return
    setLoading(true)
    try{const res=await api.get<Usuario[]>('/usuarios',{token});setUsuarios(res)}
    catch(e){console.error(e)}finally{setLoading(false)}
  },[token])
  useEffect(()=>{fetchUsuarios()},[fetchUsuarios])
  if(currentUser?.rol!=='ADMIN') return <div className="p-8 flex items-center justify-center h-full"><div className="text-center"><div className="text-5xl mb-4">🔒</div><h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso restringido</h2><p className="text-gray-500">Solo administradores.</p></div></div>
  function openCreate(){setEditUsuario(null);setForm(emptyForm);setError('');setShowModal(true)}
  function openEdit(u:Usuario){setEditUsuario(u);setForm({nombre:u.nombre,email:u.email,password:'',rol:u.rol,activo:u.activo});setError('');setShowModal(true)}
  async function handleSave(){
    setSaving(true);setError('')
    try{
      const payload={...form}
      if(!payload.password)delete(payload as Partial<UsuarioForm>).password
      if(editUsuario){await api.patch(`/usuarios/${editUsuario.id}`,payload,{token:token!})}
      else{await api.post('/usuarios',payload,{token:token!})}
      setShowModal(false);fetchUsuarios()
    }catch(e){setError(e instanceof Error?e.message:'Error')}finally{setSaving(false)}
  }
  async function handleDelete(u:Usuario){
    if(!confirm(`Eliminar ${u.nombre}?`))return
    try{await api.delete(`/usuarios/${u.id}`,{token:token!});fetchUsuarios()}
    catch(e){alert(e instanceof Error?e.message:'Error')}
  }
  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Usuarios</h1><p className="text-gray-500 mt-1">{usuarios.length} usuarios</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium" style={{background:'linear-gradient(135deg,#35933a,#27762c)'}}>+ Nuevo usuario</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading?<div className="p-16 text-center text-gray-400"><div className="text-4xl mb-3">👥</div><p>Cargando...</p></div>:(
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">{['Usuario','Email','Rol','Estado','Acciones'].map(h=><th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map(u=>(
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">{u.nombre.charAt(0).toUpperCase()}</div><span className="font-medium text-sm">{u.nombre}</span></div></td>
                  <td className="px-5 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.rol==='ADMIN'?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-600'}`}>{u.rol}</span></td>
                  <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.activo?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{u.activo?'Activo':'Inactivo'}</span></td>
                  <td className="px-5 py-4"><div className="flex gap-2"><button onClick={()=>openEdit(u)} className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">Editar</button>{u.id!==currentUser?.id&&<button onClick={()=>handleDelete(u)} className="text-sm px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">Eliminar</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editUsuario?'Editar usuario':'Nuevo usuario'}</h2>
              <button onClick={()=>setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="px-7 py-6 space-y-4">
              {error&&<div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
              {[{label:'Nombre *',key:'nombre',type:'text'},{label:'Email *',key:'email',type:'email'},{label:editUsuario?'Nueva contraseña (opcional)':'Contraseña *',key:'password',type:'password'}].map(f=>(
                <div key={f.key}><label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label><input type={f.type} value={form[f.key as keyof UsuarioForm] as string} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" /></div>
              ))}
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Rol</label><select value={form.rol} onChange={e=>setForm(prev=>({...prev,rol:e.target.value as Rol}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"><option value="EMPLEADO">Empleado</option><option value="ADMIN">Administrador</option></select></div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.activo} onChange={e=>setForm(prev=>({...prev,activo:e.target.checked}))} className="w-4 h-4 rounded" /><span className="text-sm text-gray-700">Usuario activo</span></label>
            </div>
            <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={()=>setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancelar</button>
              <button onClick={handleSave} disabled={saving||!form.nombre||!form.email||(!editUsuario&&!form.password)} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{background:'linear-gradient(135deg,#35933a,#27762c)'}}>{saving?'Guardando...':editUsuario?'Guardar cambios':'Crear usuario'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}