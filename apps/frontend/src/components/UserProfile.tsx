'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserProfile() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-600 dark:text-red-400'
      case 'INTERNE': return 'text-blue-600 dark:text-blue-400'
      case 'INNOTRACK': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-zinc-600 dark:text-zinc-400'
    }
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="ml-2 flex h-9 items-center gap-2 rounded-full bg-linear-to-br from-blue-500 to-purple-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Anmelden
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
      >
        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{user.email}</p>
              <p className={`mt-1 text-xs font-semibold ${getRoleColor(user.role)}`}>
                {user.role === 'ADMIN' ? '👑 Administrator' : user.role === 'INTERNE' ? '👤 Intern' : '🏢 Innotrack'}
              </p>
            </div>
            <button
              onClick={() => {
                logout()
                setShowDropdown(false)
              }}
              className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              Abmelden
            </button>
          </div>
        </>
      )}
    </div>
  )
}