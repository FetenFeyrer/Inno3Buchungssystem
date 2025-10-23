'use client'

import * as React from 'react'
import Calendar from '@/components/Calendar'
import Floorplan from '@/components/Floorplan'

export default function Page() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1600px] p-6">
      {/* Page Header */}
      <div className={`mb-6 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Raumbuchung
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Wähle ein Datum und deinen gewünschten Arbeitsbereich
        </p>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column – Calendar */}
        <div
          className={`lg:col-span-3 transition-all duration-700 delay-100 ${
            mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
          }`}
        >
          <Calendar />
          
          {/* Additional Info Card */}
          <div className="mt-6 rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-lg dark:border-zinc-800/60 dark:from-zinc-900/90 dark:to-zinc-900/50">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Buchungsinfo
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>Buchungen bis 18:00 Uhr am Vortag möglich</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>Stornierung bis 2 Stunden vor Buchung</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>Maximale Buchungsdauer: 7 Tage</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Column – Floor Plan */}
        <div
          className={`lg:col-span-6 transition-all duration-700 delay-200 ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
        >
          <Floorplan />
        </div>

        {/* Right Column – Statistics */}
        <div
          className={`lg:col-span-3 transition-all duration-700 delay-300 ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-4">
            {/* Stats Header */}
            <div className="rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50 p-4 shadow-lg dark:border-zinc-800/60 dark:from-zinc-900/90 dark:to-zinc-900/50">
              <h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Übersicht
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Aktuelle Statistiken
              </p>
            </div>

            {/* Stat Card 1 */}
            <div className="group rounded-xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/90">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">24</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Verfügbare Plätze</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="group rounded-xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/90">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">3</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Aktive Buchungen</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Nächste: Morgen, 09:00</p>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="group rounded-xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/90">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">12</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Kollegen vor Ort</p>
                </div>
              </div>
              <div className="mt-3 flex -space-x-2">
                {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'].map((color, i) => (
                  <div
                    key={i}
                    className={`h-6 w-6 rounded-full ${color} border-2 border-white dark:border-zinc-900`}
                  />
                ))}
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 border-2 border-white text-[10px] font-semibold text-zinc-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-300">
                  +8
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-xl border border-zinc-200/60 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-zinc-800/60 dark:from-blue-950/30 dark:to-indigo-950/30">
              <h4 className="mb-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Schnellaktionen
              </h4>
              <div className="space-y-2">
                <button className="w-full rounded-lg bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 shadow-sm transition-all hover:shadow-md dark:bg-zinc-800 dark:text-zinc-300">
                  📋 Buchungen anzeigen
                </button>
                <button className="w-full rounded-lg bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 shadow-sm transition-all hover:shadow-md dark:bg-zinc-800 dark:text-zinc-300">
                  ⭐ Favoriten verwalten
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}