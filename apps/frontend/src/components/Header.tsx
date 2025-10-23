'use client'

import UserProfile from './UserProfile'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-lg dark:border-zinc-800/50 dark:bg-zinc-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Inno3
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Buchungssystem</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <button className="group relative overflow-hidden rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <span className="relative z-10">Meine Buchungen</span>
          </button>
          <button className="group relative overflow-hidden rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <span className="relative z-10">Einstellungen</span>
          </button>
          
          {/* Profile Button */}
          <UserProfile />
        </nav>
      </div>
    </header>
  )
}