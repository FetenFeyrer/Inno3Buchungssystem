'use client'

import * as React from 'react'
import Calendar from '@/components/Calendar'
import Floorplan from '@/components/Floorplan'
import BookingTimeline, { Booking } from '@/components/BookingTimeline'
import type { SelectionMode, ZoneId } from '@/components/FloorPlanSVG'
import type { TimeRange } from '@/components/TimeSelector'

export default function Page() {
  const [mounted, setMounted] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  
  // Shared state for BookingTimeline
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [mode, setMode] = React.useState<SelectionMode>('zone')
  const [zones, setZones] = React.useState<Set<ZoneId>>(new Set())
  const [desks, setDesks] = React.useState<Set<string>>(new Set())
  const [timeRange, setTimeRange] = React.useState<TimeRange>({
    start: '09:00',
    end: '17:00'
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="mx-auto h-full max-w-full p-3 flex flex-col">
      {/* Page Header */}
      <div className={`mb-3 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <h1 className="mb-1 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Raumbuchung
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Wähle ein Datum und deinen gewünschten Arbeitsbereich
        </p>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* Left Column – Calendar */}
        <div
          className={`lg:col-span-3 flex flex-col transition-all duration-700 delay-100 ${
            mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
          }`}
        >
          <Calendar 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          
          {/* Additional Info Card */}
          <div className="mt-3 rounded-xl border border-zinc-200/60 bg-linear-to-br from-white to-zinc-50 p-3 shadow-sm dark:border-zinc-800/60 dark:from-zinc-900/90 dark:to-zinc-900/50">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <svg className="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Buchungsinfo
            </h3>
            <ul className="space-y-1.5 text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>Buchungen bis 18:00 Uhr am Vortag möglich</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>Stornierung bis 2 Stunden vor Buchung</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>Maximale Buchungsdauer: 7 Tage</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Column – Floor Plan */}
        <div
          className={`lg:col-span-5 flex flex-col transition-all duration-700 delay-200 ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
        >
          <Floorplan 
            selectedDate={selectedDate}
            bookings={bookings}
            onBookingsChange={setBookings}
            mode={mode}
            onModeChange={setMode}
            zones={zones}
            onZonesChange={setZones}
            desks={desks}
            onDesksChange={setDesks}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        {/* Right Column – Booking Timeline */}
        <div
          className={`lg:col-span-4 flex flex-col transition-all duration-700 delay-300 ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
        >
          <BookingTimeline 
            bookings={bookings}
            currentSelection={{
              mode,
              zones,
              desks
            }}
            timeRange={timeRange}
            onTimeSlotClick={(time) => {
              setTimeRange(prev => ({ ...prev, start: time }))
            }}
          />
        </div>
      </div>
    </main>
  )
}