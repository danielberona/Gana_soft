'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from './api'
interface Usuario { id: number; nombre: string; email: string; rol: 'ADMIN' | 'EMPLEADO' }
interface AuthContextType { usuario: Usuario | null; token: string | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }
const AuthContext = createContext<AuthContextType | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const stored = localStorage.getItem('ganasoft_token')
    if (stored) {
      setToken(stored)
      api.get<Usuario>('/auth/me', { token: stored }).then(setUsuario).catch(() => { localStorage.removeItem('ganasoft_token'); setToken(null) }).finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])
  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ usuario: Usuario; token: string }>('/auth/login', { email, password })
    setUsuario(res.usuario); setToken(res.token); localStorage.setItem('ganasoft_token', res.token)
  }, [])
  const logout = useCallback(async () => {
    await api.post('/auth/logout', {}, { token: token ?? undefined }).catch(() => {})
    setUsuario(null); setToken(null); localStorage.removeItem('ganasoft_token')
  }, [token])
  return <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>{children}</AuthContext.Provider>
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider'); return ctx }
