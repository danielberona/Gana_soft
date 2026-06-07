'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

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
    catch (err) { setError(err instanceof Error ? err.message : 'Credenciales incorrectas') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6f4]">
      {/* Panel izquierdo - ilustración */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0d1a0f]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Ganasoft" className="w-10 h-10 rounded-full object-cover shadow-md" />
          <span className="text-white font-bold text-lg">Ganasoft</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestión ganadera<br />
            <span className="text-campo-400">inteligente y simple</span>
          </h1>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Controla tu hato, registra producción, vacunaciones, salud y más — todo en un solo lugar, desde cualquier dispositivo.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '100%', label: 'Gratuito y en la nube' },
              { num: '∞', label: 'Animales sin límite' },
              { num: '9', label: 'Módulos disponibles' },
              { num: '24/7', label: 'Acceso desde cualquier lugar' },
            ].map(s => (
              <div key={s.label} className="bg-[#162b19] rounded-2xl p-4">
                <p className="text-2xl font-bold text-campo-400">{s.num}</p>
                <p className="text-gray-400 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs">© 2026 Ganasoft. Sistema de gestión ganadera.</p>
      </div>

      {/* Panel derecho - login */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/logo.png" alt="Ganasoft" className="w-10 h-10 rounded-full object-cover shadow-sm" />
            <span className="text-gray-900 font-bold text-lg">Ganasoft</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ganasoft.com" required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-campo-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-campo-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-campo-500 hover:bg-campo-600 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</> : <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-100 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-2">Credenciales de prueba</p>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span className="font-mono">admin@ganasoft.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Empleado:</span>
                <span className="font-mono">empleado@ganasoft.com / empleado123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
