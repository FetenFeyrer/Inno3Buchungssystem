'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type User = {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'INTERNE' | 'INNOTRACK'
}

type AuthContextType = {
  user: User | null
  login: (email: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for user
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string) => {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
      if (!response.ok) throw new Error('User not found')
      
      const userData = await response.json()
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}