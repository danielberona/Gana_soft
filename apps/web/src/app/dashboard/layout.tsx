'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider, useAuth } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: '📊', exact: true },
  { href: '/dashboard/animales', label: 'Animales', icon: '🐄' },
  { href: '/dashboard/salud', label: 'Salud', icon: '🏥' },
  { href: '/dashboard/vacunaciones', label: 'Vacunaciones', icon: '💉' },
  { href: '/dashboard/produccion', label: 'Producción', icon: '🥛' },
  { href: '/dashboard/reproduccion', label: 'Reproducción', icon: '🐣' },
  { href: '/dashboard/potreros', label: 'Potreros', icon: '🌿' },
  { href: '/dashboard/tareas', label: 'Tareas', icon: '✅' },
  { href: '/dashboard/reportes', label: 'Reportes', icon: '📈' },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: '👥', adminOnly: true },
]

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { usuario, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => { if (!loading && !usuario) router.push('/login') }, [loading, usuario, router])
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f5ef' }}>
      <div className="text-center"><div className="text-5xl mb-4">🐄</div><p className="text-gray-500">Cargando Ganasoft...</p></div>
    </div>
  )
  if (!usuario) return null
  const filteredNav = navItems.filter(item => !item.adminOnly || usuario.rol === 'ADMIN')
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f5ef' }}>
      <aside className="w-60 flex flex-col shadow-xl flex-shrink-0" style={{ background: 'linear-gradient(180deg,#1a3e1d 0%,#215e25 100%)' }}>
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐄</span>
            <div><div className="text-lg font-bold text-white">Ganasoft</div><p className="text-green-300 text-xs">Gestión Ganadera</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {filteredNav.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-white/15 text-white' : 'text-green-200 hover:bg-white/8 hover:text-white'}`}>
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{usuario.nombre}</p>
              <p className="text-green-400 text-xs">{usuario.rol}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full px-3 py-2 rounded-xl text-sm text-green-200 hover:bg-white/10 hover:text-white transition text-left">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><DashboardContent>{children}</DashboardContent></AuthProvider>
}
