'use client'

import * as React from 'react'
import { ZoneId } from './FloorPlanSVG'
import { SelectionMode } from './FloorPlanSVG'

export interface Booking {
  id: string
  start: string // HH:MM
  end: string
  type: 'floor' | 'zone' | 'desk'
  zones?: ZoneId[]
  desks?: string[]
  user?: string
}

interface BookingTimelineProps {
  bookings: Booking[]
  currentSelection?: {
    mode: SelectionMode
    zones: Set<ZoneId>
    desks: Set<string>
  }
  timeRange: { start: string; end: string }
  onTimeSlotClick?: (time: string) => void
}

const ZONE_COLORS: Record<ZoneId, { bg: string; border: string; text: string }> = {
  'zone-1': { bg: 'bg-amber-200/80', border: 'border-amber-400', text: 'text-amber-700' },
  'zone-2': { bg: 'bg-blue-200/80', border: 'border-blue-400', text: 'text-blue-700' },
  'zone-3': { bg: 'bg-green-200/80', border: 'border-green-400', text: 'text-green-700' },
}

export default function BookingTimeline({ 
  bookings, 
  currentSelection,
  timeRange,
  onTimeSlotClick 
}: BookingTimelineProps) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 8:00 to 18:00

  // Group bookings by resource (floor, zones, desks)
  const getBookingLabel = (booking: Booking): string => {
    if (booking.type === 'floor') return 'Gesamtes Stockwerk'
    if (booking.type === 'zone' && booking.zones) {
      return booking.zones.map(z => `Zone ${z.split('-')[1]}`).join(', ')
    }
    if (booking.type === 'desk' && booking.desks) {
      return `${booking.desks.length} Plätze`
    }
    return ''
  }

  const getBookingColor = (booking: Booking): string => {
    if (booking.type === 'floor') return 'bg-purple-400'
    if (booking.type === 'zone' && booking.zones?.length === 1) {
      return ZONE_COLORS[booking.zones[0]]?.bg.replace('/80', '') || 'bg-blue-400'
    }
    return 'bg-blue-400'
  }

  const timeToPosition = (time: string): number => {
    const [hour, minute] = time.split(':').map(Number)
    return ((hour - 8) + minute / 60) * 100 / 10 // 10 hours total (8-18)
  }

  const getTimeSlotAvailability = (hour: number): 'available' | 'partial' | 'booked' => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`
    const nextTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`
    
    // Check if any booking overlaps with this hour
    const overlappingBookings = bookings.filter(b => {
      return b.start < nextTimeStr && b.end > timeStr
    })

    if (overlappingBookings.length === 0) return 'available'
    if (overlappingBookings.some(b => b.type === 'floor')) return 'booked'
    return 'partial'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Zeitstrahl - Belegung
        </h3>
        <div className="flex gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm bg-green-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Verfügbar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm bg-orange-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Teilweise</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm bg-red-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Belegt</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-zinc-200 bg-white p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {/* Time Labels */}
        <div className="relative mb-2">
          <div className="flex justify-between">
            {hours.map((hour) => (
              <div key={hour} className="flex flex-col items-center" style={{ width: '9.09%' }}>
                <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Bar */}
        <div className="relative mb-3 h-6 rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-600">
          <div className="flex h-full">
            {hours.map((hour) => {
              const status = getTimeSlotAvailability(hour)
              const bgColor = 
                status === 'available' ? 'bg-green-100 dark:bg-green-900/30' :
                status === 'partial' ? 'bg-orange-100 dark:bg-orange-900/30' :
                'bg-red-100 dark:bg-red-900/30'
              
              return (
                <div
                  key={hour}
                  className={`flex-1 border-r border-zinc-200 transition-all hover:brightness-95 cursor-pointer ${bgColor} dark:border-zinc-700`}
                  onClick={() => onTimeSlotClick?.(`${hour.toString().padStart(2, '0')}:00`)}
                  title={`${hour}:00 - ${status === 'available' ? 'Verfügbar' : status === 'partial' ? 'Teilweise belegt' : 'Belegt'}`}
                />
              )
            })}
          </div>

          {/* Current Selection Highlight */}
          {currentSelection && (
            <div
              className="absolute top-0 h-full border-2 border-blue-600 bg-blue-500/20 dark:border-blue-400 dark:bg-blue-500/30"
              style={{
                left: `${timeToPosition(timeRange.start)}%`,
                width: `${timeToPosition(timeRange.end) - timeToPosition(timeRange.start)}%`,
              }}
            >
              <div className="flex h-full items-center justify-center">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  Auswahl
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bookings */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
            Bestehende Buchungen
          </h4>
          {bookings.length === 0 ? (
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 italic py-1">
              Keine Buchungen für diesen Tag
            </p>
          ) : (
            <div className="space-y-1.5">
              {bookings.map((booking) => {
                const width = timeToPosition(booking.end) - timeToPosition(booking.start)
                const left = timeToPosition(booking.start)
                
                return (
                  <div key={booking.id} className="relative h-7">
                    <div
                      className={`absolute h-full rounded-md border-2 shadow-sm transition-all hover:shadow-md ${getBookingColor(booking)} border-zinc-300 dark:border-zinc-600`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    >
                      <div className="flex h-full items-center justify-between px-1.5">
                        <span className="text-[10px] font-semibold text-white truncate">
                          {getBookingLabel(booking)}
                        </span>
                        <span className="text-[10px] text-white/90">
                          {booking.start} - {booking.end}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}