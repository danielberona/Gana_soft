'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider, useAuth } from '@/lib/auth'
import {
  LayoutDashboard, Cow, HeartPulse, Syringe, Milk, Baby,
  TreePine, CheckSquare, BarChart3, Users, LogOut, Menu, X,
  ChevronRight, Bell
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/animales', label: 'Animales', icon: Cow },
  { href: '/dashboard/salud', label: 'Salud', icon: HeartPulse },
  { href: '/dashboard/vacunaciones', label: 'Vacunaciones', icon: Syringe },
  { href: '/dashboard/produccion', label: 'Producción', icon: Milk },
  { href: '/dashboard/reproduccion', label: 'Reproducción', icon: Baby },
  { href: '/dashboard/potreros', label: 'Potreros', icon: TreePine },
  { href: '/dashboard/tareas', label: 'Tareas', icon: CheckSquare },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
]

const pageTitle: Record<string, string> = {
  '/dashboard': 'Panel Principal',
  '/dashboard/animales': 'Animales',
  '/dashboard/salud': 'Salud Animal',
  '/dashboard/vacunaciones': 'Vacunaciones',
  '/dashboard/produccion': 'Producción',
  '/dashboard/reproduccion': 'Reproducción',
  '/dashboard/potreros': 'Potreros',
  '/dashboard/tareas': 'Tareas',
  '/dashboard/reportes': 'Reportes',
  '/dashboard/usuarios': 'Usuarios',
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { usuario, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { if (!loading && !usuario) router.push('/login') }, [loading, usuario, router])
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f4]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-campo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Cow className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-500 font-medium">Cargando Ganasoft...</p>
      </div>
    </div>
  )
  if (!usuario) return null

  const filteredNav = navItems.filter(item => !item.adminOnly || usuario.rol === 'ADMIN')
  const currentTitle = Object.entries(pageTitle).find(([k]) => pathname === k || (!pageTitle[pathname] && pathname.startsWith(k + '/')))?.[1] || 'Ganasoft'

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? 'w-72' : 'w-64'} flex flex-col h-full bg-[#0d1a0f]`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1c3020]">
        <div className="w-9 h-9 rounded-xl bg-campo-500 flex items-center justify-center flex-shrink-0">
          <Cow className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">Ganasoft</p>
          <p className="text-[#4d7551] text-xs">Gestión Ganadera</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[#3d6042] text-xs font-semibold uppercase tracking-wider px-3 mb-2">Menú</p>
        {filteredNav.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${active
                ? 'bg-campo-500 text-white shadow-sm'
                : 'text-[#7a9e7e] hover:bg-[#162b19] hover:text-white'}`}>
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-[#4d7551] group-hover:text-[#7a9e7e]'}`} size={18} />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-campo-200" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#1c3020]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#162b19] mb-2">
          <div className="w-8 h-8 rounded-full bg-campo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{usuario.nombre}</p>
            <p className="text-[#4d7551] text-xs">{usuario.rol === 'ADMIN' ? 'Administrador' : 'Empleado'}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#7a9e7e] hover:bg-[#162b19] hover:text-white transition-all">
          <LogOut size={16} className="flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f4]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-0 flex items-center gap-4 h-14 flex-shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-800">{currentTitle}</h1>
          </div>
          <button className="relative text-gray-400 hover:text-gray-600 transition">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-campo-500 flex items-center justify-center text-white font-bold text-sm">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{usuario.nombre.split(' ')[0]}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><DashboardContent>{children}</DashboardContent></AuthProvider>
}
