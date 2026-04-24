'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); router.push('/dashboard') }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al iniciar sesión') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(135deg,#1a3e1d 0%,#27762c 40%,#5a2f18 100%)'}}>
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">🐄</span>
          <div><div className="text-2xl font-bold text-gray-900">Ganasoft</div><div className="text-xs text-gray-400">Sistema de Gestión Ganadera</div></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h1>
        <p className="text-gray-500 text-sm mb-8">Inicia sesión en tu cuenta</p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@ganasoft.com" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-60" style={{background:'linear-gradient(135deg,#35933a,#27762c)'}}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
          </button>
        </form>
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-medium mb-1">Credenciales de prueba:</p>
          <p>Admin: admin@ganasoft.com / admin123</p>
          <p>Empleado: empleado@ganasoft.com / empleado123</p>
        </div>
      </div>
    </div>
  )
}
