'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (email: string, password: string, redirect?: boolean) => Promise<void>
  googleLogin: (credential: string, redirect?: boolean) => Promise<void>
  register: (data: RegisterData, redirect?: boolean) => Promise<void>
  logout: () => void
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  role?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('auth_tokens')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAccessToken(parsed.access_token)
        setRefreshToken(parsed.refresh_token)
        setUser(parsed.user)
      } catch {
        localStorage.removeItem('auth_tokens')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string, redirect: boolean = true) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      const data = await res.json()
      setAccessToken(data.access_token)
      setRefreshToken(data.refresh_token)
      setUser(data.user)
      localStorage.setItem('auth_tokens', JSON.stringify(data))
      if (redirect) {
        if (data.user.role === 'customer') {
          router.push('/dashboard/customer')
        } else if (data.user.role === 'manufacturer') {
          router.push('/dashboard/manufacturer')
        } else if (data.user.role === 'corporate_admin') {
          router.push('/dashboard/corporate')
        } else if (data.user.role === 'superadmin') {
          router.push('/dashboard/admin')
        }
      }
    } else {
      const err = await res.json()
      throw new Error(err.detail || 'Login failed')
    }
  }, [router])

  const googleLogin = useCallback(async (credential: string, redirect: boolean = true) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('auth_tokens', JSON.stringify(data))
      setAccessToken(data.access_token)
      setRefreshToken(data.refresh_token)
      setUser(data.user)
      if (redirect) {
        if (data.user.role === 'customer') {
          router.push('/dashboard/customer')
        } else if (data.user.role === 'manufacturer') {
          router.push('/dashboard/manufacturer')
        } else if (data.user.role === 'corporate_admin') {
          router.push('/dashboard/corporate')
        } else if (data.user.role === 'superadmin') {
          router.push('/dashboard/admin')
        }
      }
    } else {
      const err = await res.json()
      throw new Error(err.detail || 'Google Login failed')
    }
  }, [router])

  const register = useCallback(async (data: RegisterData, redirect: boolean = true) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }))
      let errorMessage = 'Registration failed'
      if (err.detail) {
        if (typeof err.detail === 'string') errorMessage = err.detail
        else if (Array.isArray(err.detail)) errorMessage = err.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        else errorMessage = JSON.stringify(err.detail)
      }
      throw new Error(errorMessage)
    }
    await login(data.email, data.password, redirect)
  }, [login])

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem('auth_tokens')
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isLoading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}