'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function UserProfile() {
  const { user, login, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure we're mounted (client-side only)
  useState(() => {
    setMounted(true)
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email)
      setEmail('')
      setShowLoginModal(false)
    } catch (error) {
      alert('Login fehlgeschlagen. Bitte überprüfe deine E-Mail.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-600 dark:text-red-400'
      case 'INTERNE': return 'text-blue-600 dark:text-blue-400'
      case 'INNOTRACK': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-zinc-600 dark:text-zinc-400'
    }
  }

  // Login Modal Component
  const LoginModal = () => {
    if (!showLoginModal || !mounted) return null

    return createPortal(
      <div 
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" 
        onClick={() => setShowLoginModal(false)}
      >
        <div 
          className="relative w-full max-w-md my-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900" 
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">Anmelden</h2>
          <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">Gib deine E-Mail-Adresse ein, um dich anzumelden.</p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-linear-to-r from-blue-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-4 rounded-md bg-blue-50 p-2.5 dark:bg-blue-950/30">
            <p className="mb-1.5 text-[10px] font-semibold text-blue-900 dark:text-blue-100">Test-Accounts:</p>
            <div className="space-y-0.5 text-[10px] text-blue-700 dark:text-blue-300">
              <div>• admin@inno3.de (Admin)</div>
              <div>• user@higl.de (Intern)</div>
              <div>• track@innotrack.de (Innotrack)</div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowLoginModal(true)}
          className="ml-1.5 flex h-7 items-center gap-1.5 rounded-full bg-linear-to-br from-blue-500 to-purple-600 px-3 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Anmelden
        </button>
        <LoginModal />
      </>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="ml-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-[10px] font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
      >
        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400">{user.email}</p>
              <p className={`mt-0.5 text-[10px] font-semibold ${getRoleColor(user.role)}`}>
                {user.role === 'ADMIN' ? '👑 Administrator' : user.role === 'INTERNE' ? '👤 Intern' : '🏢 Innotrack'}
              </p>
            </div>
            <button
              onClick={() => {
                logout()
                setShowDropdown(false)
              }}
              className="w-full rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-all hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              Abmelden
            </button>
          </div>
        </>
      )}
    </div>
  )
}