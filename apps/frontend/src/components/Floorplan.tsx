'use client'

import * as React from 'react'
import FloorPlanSVG, { SelectionMode, ZoneId } from './FloorPlanSVG'
import { useToast } from '@/components/Toast'
import TimeSelector, { TimeRange } from './TimeSelector'
import BookingTimeline, { Booking } from './BookingTimeline'

function SelectionControl({
  value,
  onChange,
}: {
  value: SelectionMode
  onChange: (v: SelectionMode) => void
}) {
  const options: { value: SelectionMode; label: string; icon: string; description: string }[] = [
    { value: 'floor', label: 'Gesamtes Stockwerk', icon: '🏢', description: 'Komplette Fläche' },
    { value: 'zone', label: 'Teilbereiche', icon: '📐', description: 'Bis zu 3 Bereiche' },
    { value: 'desk', label: 'Einzelplätze', icon: '💺', description: 'Spezifische Plätze' },
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Auswahlmodus
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all
                ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
                }
              `}
            >
              {/* Radio indicator */}
              <div className="absolute right-3 top-3">
                <div
                  className={`
                  h-5 w-5 rounded-full border-2 transition-all
                  ${
                    isActive
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }
                `}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1 pr-6">
                  <div
                    className={`
                    text-sm font-semibold transition-colors
                    ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'}
                  `}
                  >
                    {opt.label}
                  </div>
                  <div
                    className={`
                    text-xs transition-colors
                    ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'}
                  `}
                  >
                    {opt.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Floorplan() {
  const { showToast } = useToast()
  const [mode, setMode] = React.useState<SelectionMode>('zone')
  const [zones, setZones] = React.useState<Set<ZoneId>>(new Set())
  const [desks, setDesks] = React.useState<Set<string>>(new Set())
  
  // New state for time selection
  const [timeRange, setTimeRange] = React.useState<TimeRange>({
    start: '09:00',
    end: '17:00'
  })

  // Mock bookings data - replace with actual API call
  const [bookings] = React.useState<Booking[]>([
    {
      id: '1',
      start: '08:00',
      end: '12:00',
      type: 'zone',
      zones: ['zone-1'], // Changed from 'zone-a' to 'zone-1'
      user: 'Max Mustermann'
    },
    {
      id: '2',
      start: '14:00',
      end: '16:00',
      type: 'desk',
      desks: ['desk-1', 'desk-2'],
      user: 'Anna Schmidt'
    }
  ])

  const resetSelection = React.useCallback(() => {
    setZones(new Set())
    setDesks(new Set())
  }, [])

  const handleModeChange = (m: SelectionMode) => {
    setMode(m)
    resetSelection()
  }

  const onSelectFloor = () => {
    resetSelection()
  }

  const onToggleZone = (id: ZoneId) => {
    setZones((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        // Auto-switch to floor mode if all 3 zones are selected
        if (next.size === 3) {
          setTimeout(() => {
            setMode('floor')
            resetSelection()
          }, 300)
        }
      }
      return next
    })
  }

  const onToggleDesk = (id: string) => {
    setDesks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasSelection =
    mode === 'floor' ? true : mode === 'zone' ? zones.size > 0 : desks.size > 0

  return (
    <section className="flex h-full flex-col gap-4">
      {/* Selection Mode Control */}
      <SelectionControl value={mode} onChange={handleModeChange} />

      {/* Time Selection */}
      <TimeSelector value={timeRange} onChange={setTimeRange} />

      {/* Floor Plan Visualization */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 p-2 shadow-lg dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-800">
        <FloorPlanSVG
          mode={mode}
          selectedZones={zones}
          selectedDesks={desks}
          onSelectFloor={onSelectFloor}
          onToggleZone={onToggleZone}
          onToggleDesk={onToggleDesk}
          className="h-full w-full"
        />
      </div>

      {/* Timeline */}
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

      {/* Footer with action button and info */}
      <footer className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {mode === 'floor' && (
            <span>✓ Gesamtes Stockwerk wird gebucht</span>
          )}
          {mode === 'zone' && zones.size === 0 && (
            <span>Wähle bis zu 3 Bereiche aus</span>
          )}
          {mode === 'zone' && zones.size > 0 && (
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {zones.size} {zones.size === 1 ? 'Bereich' : 'Bereiche'} ausgewählt
              {zones.size === 3 && ' → Wechselt zu Gesamtfläche'}
            </span>
          )}
          {mode === 'desk' && desks.size === 0 && (
            <span>Wähle einzelne Arbeitsplätze aus</span>
          )}
          {mode === 'desk' && desks.size > 0 && (
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {desks.size} {desks.size === 1 ? 'Platz' : 'Plätze'} ausgewählt
            </span>
          )}
        </div>
        <button
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-md"
          disabled={!hasSelection}
          onClick={() => {
            const payload =
              mode === 'floor'
                ? { type: 'floor', timeRange }
                : mode === 'zone'
                ? { type: 'zones', zones: Array.from(zones), timeRange }
                : { type: 'desks', desks: Array.from(desks), timeRange }
            
            showToast(`Buchung von ${timeRange.start} bis ${timeRange.end} erfolgreich! 🎉`, 'success')
            console.log('Booking payload:', payload)
          }}
        >
          Jetzt buchen
        </button>
      </footer>
    </section>
  )
}