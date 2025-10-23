'use client'

import * as React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const { login, user } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(email)
      router.push('/')
    } catch (error) {
      setError('Login fehlgeschlagen. Bitte überprüfe deine E-Mail.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"></div>
        <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Inno3 Buchungssystem
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Melde dich an, um fortzufahren
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="w-full rounded-lg border-2 border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Wird angemeldet...
                </span>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>

          {/* Test Accounts Info */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
            <p className="mb-2 text-xs font-semibold text-blue-900 dark:text-blue-100">
              Test-Accounts:
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setEmail('admin@inno3.de')}
                className="w-full rounded-md bg-white px-3 py-2 text-left text-xs text-blue-700 transition-all hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
              >
                • admin@inno3.de <span className="text-[10px] opacity-70">(Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => setEmail('user@higl.de')}
                className="w-full rounded-md bg-white px-3 py-2 text-left text-xs text-blue-700 transition-all hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
              >
                • user@higl.de <span className="text-[10px] opacity-70">(Intern)</span>
              </button>
              <button
                type="button"
                onClick={() => setEmail('track@innotrack.de')}
                className="w-full rounded-md bg-white px-3 py-2 text-left text-xs text-blue-700 transition-all hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
              >
                • track@innotrack.de <span className="text-[10px] opacity-70">(Innotrack)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          © 2024 Inno3 Buchungssystem. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  )
}

