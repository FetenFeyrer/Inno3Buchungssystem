'use client'

import * as React from 'react'
import FloorPlanSVG, { SelectionMode, ZoneId } from './FloorPlanSVG'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/contexts/AuthContext'
import TimeSelector, { TimeRange } from './TimeSelector'
import BookingTimeline, { Booking } from './BookingTimeline'

type FloorplanProps = {
  selectedDate: Date
}

type Bookable = {
  id: number
  name: string
  type: 'FLOOR' | 'AREA' | 'PLACE'
  parentId: number | null
}

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

export default function Floorplan({ selectedDate }: FloorplanProps) {
  const { showToast } = useToast()
  const { user } = useAuth()
  
  const [mode, setMode] = React.useState<SelectionMode>('zone')
  const [zones, setZones] = React.useState<Set<ZoneId>>(new Set())
  const [desks, setDesks] = React.useState<Set<string>>(new Set())
  const [timeRange, setTimeRange] = React.useState<TimeRange>({
    start: '09:00',
    end: '17:00'
  })
  
  // Data from API
  const [bookables, setBookables] = React.useState<Bookable[]>([])
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [isBooking, setIsBooking] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  // Calculate booked zones and desks based on current time range
  const bookedResources = React.useMemo(() => {
    const booked = {
      zones: new Set<ZoneId>(),
      desks: new Set<string>(),
      isFloorBooked: false
    }

    bookings.forEach(booking => {
      // Check if booking overlaps with selected time range
      const overlaps = booking.start < timeRange.end && booking.end > timeRange.start

      if (overlaps) {
        if (booking.type === 'floor') {
          booked.isFloorBooked = true
        } else if (booking.type === 'zone' && booking.zones) {
          booking.zones.forEach(z => booked.zones.add(z))
        } else if (booking.type === 'desk' && booking.desks) {
          booking.desks.forEach(d => booked.desks.add(d))
        }
      }
    })

    return booked
  }, [bookings, timeRange])

  // Fetch bookables on mount
  React.useEffect(() => {
    fetchBookables()
  }, [])

  // Fetch bookings when date changes
  React.useEffect(() => {
    if (selectedDate) {
      fetchBookings(selectedDate)
    }
  }, [selectedDate])

  const fetchBookables = async () => {
    try {
      const response = await fetch('/api/bookables')
      if (!response.ok) throw new Error('Failed to fetch bookables')
      const data = await response.json()
      setBookables(data)
    } catch (error) {
      console.error('Error fetching bookables:', error)
      showToast('Fehler beim Laden der Buchungsoptionen', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBookings = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/bookings?date=${dateStr}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      
      // Transform API bookings to timeline format
      const transformedBookings: Booking[] = data.map((booking: any) => {
        const startTime = new Date(booking.start).toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        const endTime = new Date(booking.end).toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })

        // Map bookable to zone or desk
        if (booking.bookable.type === 'AREA') {
          const zoneMap: Record<string, ZoneId> = {
            'Balkon': 'zone-1',
            'Mitte': 'zone-2',
            'Fenster': 'zone-3',
          }
          return {
            id: String(booking.id),
            start: startTime,
            end: endTime,
            type: 'zone',
            zones: [zoneMap[booking.bookable.name] || 'zone-1'],
            user: booking.user.name
          }
        } else if (booking.bookable.type === 'PLACE') {
          return {
            id: String(booking.id),
            start: startTime,
            end: endTime,
            type: 'desk',
            desks: [`desk-${booking.bookable.id}`],
            user: booking.user.name
          }
        } else {
          return {
            id: String(booking.id),
            start: startTime,
            end: endTime,
            type: 'floor',
            user: booking.user.name
          }
        }
      })
      
      setBookings(transformedBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      showToast('Fehler beim Laden der Buchungen', 'error')
    }
  }

  const handleBooking = async () => {
    if (!user) {
      showToast('Bitte melde dich zuerst an', 'error')
      return
    }

    // Check if user is trying to book already booked resources
    const isAdmin = user.role === 'ADMIN'
    
    if (!isAdmin) {
      // Check for conflicts
      if (mode === 'floor' && bookedResources.isFloorBooked) {
        showToast('Das Stockwerk ist bereits gebucht. Nur Admins können überschreiben.', 'error')
        return
      }
      
      if (mode === 'zone') {
        const conflictingZones = Array.from(zones).filter(z => bookedResources.zones.has(z))
        if (conflictingZones.length > 0) {
          showToast(`Bereiche bereits gebucht: ${conflictingZones.join(', ')}. Nur Admins können überschreiben.`, 'error')
          return
        }
      }
      
      if (mode === 'desk') {
        const conflictingDesks = Array.from(desks).filter(d => bookedResources.desks.has(d))
        if (conflictingDesks.length > 0) {
          showToast(`${conflictingDesks.length} Plätze bereits gebucht. Nur Admins können überschreiben.`, 'error')
          return
        }
      }
    }

    setIsBooking(true)
    try {
      // Map UI selections to database IDs
      let bookableIds: number[] = []
      
      if (mode === 'floor') {
        const floor = bookables.find(b => b.type === 'FLOOR')
        if (floor) bookableIds = [floor.id]
      } else if (mode === 'zone') {
        const zoneMap: Record<string, string> = {
          'zone-1': 'Balkon',
          'zone-2': 'Mitte',
          'zone-3': 'Fenster',
        }
        
        bookableIds = Array.from(zones)
          .map(zoneId => {
            const zoneName = zoneMap[zoneId]
            return bookables.find(b => b.type === 'AREA' && b.name === zoneName)?.id
          })
          .filter((id): id is number => id !== undefined)
      } else if (mode === 'desk') {
        bookableIds = Array.from(desks)
          .map(deskId => {
            const deskNumber = deskId.replace('desk-', '')
            return bookables.find(b => 
              b.type === 'PLACE' && b.name.includes(deskNumber)
            )?.id
          })
          .filter((id): id is number => id !== undefined)
      }
      
      if (bookableIds.length === 0) {
        showToast('Keine gültigen Buchungsziele gefunden', 'error')
        return
      }
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          bookableIds,
          start: timeRange.start,
          end: timeRange.end,
          date: selectedDate.toISOString(),
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 409) {
          if (isAdmin) {
            showToast('Admin-Override: Buchung trotz Konflikt erstellt', 'success')
          } else {
            showToast(`Buchungskonflikt: ${data.conflicts?.[0]?.bookable || 'Bereits gebucht'}`, 'error')
          }
        } else {
          showToast(data.error || 'Buchung fehlgeschlagen', 'error')
        }
        return
      }
      
      const message = isAdmin && (bookedResources.zones.size > 0 || bookedResources.desks.size > 0 || bookedResources.isFloorBooked)
        ? `Admin-Buchung von ${timeRange.start} bis ${timeRange.end} erfolgreich! 👑`
        : `Buchung von ${timeRange.start} bis ${timeRange.end} erfolgreich! 🎉`
      
      showToast(message, 'success')
      
      // Reload bookings
      await fetchBookings(selectedDate)
      
      // Reset selection
      resetSelection()
    } catch (error) {
      console.error('Booking error:', error)
      showToast('Ein Fehler ist aufgetreten', 'error')
    } finally {
      setIsBooking(false)
    }
  }

  const resetSelection = React.useCallback(() => {
    setZones(new Set())
    setDesks(new Set())
  }, [])

  const handleModeChange = (m: SelectionMode) => {
    setMode(m)
    resetSelection()
  }

  const onSelectFloor = () => {
    // Check if floor is booked and user is not admin
    if (bookedResources.isFloorBooked && user?.role !== 'ADMIN') {
      showToast('Stockwerk bereits gebucht. Nur Admins können überschreiben.', 'error')
      return
    }
    resetSelection()
  }

  const onToggleZone = (id: ZoneId) => {
    // Check if zone is booked and user is not admin
    if (bookedResources.zones.has(id) && user?.role !== 'ADMIN') {
      showToast('Bereich bereits gebucht. Nur Admins können überschreiben.', 'error')
      return
    }

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
    // Check if desk is booked and user is not admin
    if (bookedResources.desks.has(id) && user?.role !== 'ADMIN') {
      showToast('Platz bereits gebucht. Nur Admins können überschreiben.', 'error')
      return
    }

    setDesks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasSelection =
    mode === 'floor' ? true : mode === 'zone' ? zones.size > 0 : desks.size > 0

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Lädt Buchungsoptionen...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="flex h-full flex-col gap-4">
      {/* Admin Badge */}
      {user?.role === 'ADMIN' && (
        <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            👑 Admin-Modus: Du kannst bereits gebuchte Bereiche überschreiben
          </p>
        </div>
      )}

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
          bookedZones={bookedResources.zones}
          bookedDesks={bookedResources.desks}
          isFloorBooked={bookedResources.isFloorBooked}
          isAdmin={user?.role === 'ADMIN'}
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
          disabled={!hasSelection || isBooking || !user}
          onClick={handleBooking}
        >
          {isBooking ? 'Wird gebucht...' : 'Jetzt buchen'}
        </button>
      </footer>
    </section>
  )
}