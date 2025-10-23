'use client'

import * as React from 'react'
import FloorPlanSVG, { SelectionMode, ZoneId } from './FloorPlanSVG'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/contexts/AuthContext'
import TimeSelector, { TimeRange } from './TimeSelector'
import { Booking } from './BookingTimeline'

type FloorplanProps = {
  selectedDate: Date
  bookings: Booking[]
  onBookingsChange: (bookings: Booking[]) => void
  mode: SelectionMode
  onModeChange: (mode: SelectionMode) => void
  zones: Set<ZoneId>
  onZonesChange: (zones: Set<ZoneId>) => void
  desks: Set<string>
  onDesksChange: (desks: Set<string>) => void
  timeRange: TimeRange
  onTimeRangeChange: (timeRange: TimeRange) => void
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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        Auswahlmodus
      </label>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {options.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                group relative overflow-hidden rounded-lg border-2 p-2 text-left transition-all
                ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-sm dark:bg-blue-950/30'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
                }
              `}
            >
              {/* Radio indicator */}
              <div className="absolute right-2 top-2">
                <div
                  className={`
                  h-3.5 w-3.5 rounded-full border-2 transition-all
                  ${
                    isActive
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }
                `}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex items-start gap-2">
                <span className="text-lg">{opt.icon}</span>
                <div className="flex-1 pr-5">
                  <div
                    className={`
                    text-xs font-semibold transition-colors
                    ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'}
                  `}
                  >
                    {opt.label}
                  </div>
                  <div
                    className={`
                    text-[10px] transition-colors
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

export default function Floorplan({ 
  selectedDate, 
  bookings, 
  onBookingsChange,
  mode,
  onModeChange,
  zones,
  onZonesChange,
  desks,
  onDesksChange,
  timeRange,
  onTimeRangeChange
}: FloorplanProps) {
  const { showToast } = useToast()
  const { user } = useAuth()
  
  // Data from API
  const [bookables, setBookables] = React.useState<Bookable[]>([])
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
      console.log('Fetched bookables:', data)
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
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            console.log('Fetching bookings for date:', dateStr)
      const response = await fetch(`/api/bookings?date=${dateStr}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      console.log('Raw bookings from API:', data)
      
      // Transform API bookings to timeline format
      const transformedBookings = data.map((booking: any) => {
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
            'Balkon': 'zone-3',
            'Mitte': 'zone-2',
            'Fenster': 'zone-1',
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
          // Find the parent area to determine which zone this desk belongs to
          const parentArea = bookables.find(b => b.id === booking.bookable.parentId)
          
          if (!parentArea) {
            console.warn('Parent area not found for desk:', booking.bookable.name)
            return null
          }
          
          // Map DB area names to zone IDs
          const areaToZoneMap: Record<string, ZoneId> = {
            'Balkon': 'zone-3',
            'Mitte': 'zone-2',
            'Fenster': 'zone-1',
          }
          const zoneId = areaToZoneMap[parentArea.name]
          
          if (!zoneId || zoneId !== 'zone-1') {
            // Only zone-1 has desks in the UI
            console.warn('Desk not in zone-1, cannot display:', booking.bookable.name)
            return null
          }
          
          // Extract desk number from name (e.g., "Fenster - Platz 3" -> 3)
          const deskNumMatch = booking.bookable.name.match(/Platz (\d+)/)
          if (!deskNumMatch) {
            console.warn('Could not extract desk number from:', booking.bookable.name)
            return null
          }
          const deskNum = parseInt(deskNumMatch[1])
          
          // Calculate row and col from desk number (matching FloorPlanSVG layout)
          const DESK_COLS = 5
          const row = Math.floor((deskNum - 1) / DESK_COLS)
          const col = (deskNum - 1) % DESK_COLS
          
          // Generate desk ID matching FloorPlanSVG format: desk-zone-1-row-col
          const deskId = `desk-${zoneId}-${row}-${col}`
          
          return {
            id: String(booking.id),
            start: startTime,
            end: endTime,
            type: 'desk',
            desks: [deskId],
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
      }).filter((booking: Booking | null): booking is Booking => booking !== null)
      
      console.log('Transformed bookings:', transformedBookings)
      onBookingsChange(transformedBookings)
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
          'zone-1': 'Fenster',   // UI "Terasse" (zone-1) -> DB "Fenster"
          'zone-2': 'Mitte',     // UI "Mitte" (zone-2) -> DB "Mitte"
          'zone-3': 'Balkon',    // UI "Balkon" (zone-3) -> DB "Balkon"
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
            // Parse desk ID format: desk-zone-1-0-2 -> zone=zone-1, row=0, col=2
            const parts = deskId.split('-')
            if (parts.length !== 5 || parts[0] !== 'desk') {
              console.warn('Invalid desk ID format:', deskId)
              return undefined
            }
            
            const zoneId = `${parts[1]}-${parts[2]}` as ZoneId  // "zone-1"
            const row = parseInt(parts[3])
            const col = parseInt(parts[4])
            
            // Calculate desk number (1-based): row 0, col 0 = desk 1
            const DESK_COLS = 5
            const deskNumber = row * DESK_COLS + col + 1
            
            // Map zone ID to DB area name
            const zoneToAreaMap: Record<ZoneId, string> = {
              'zone-1': 'Fenster',  // UI "Terasse" -> DB "Fenster"
              'zone-2': 'Mitte',
              'zone-3': 'Balkon',
            }
            const areaName = zoneToAreaMap[zoneId]
            
            if (!areaName) {
              console.warn('Unknown zone ID:', zoneId)
              return undefined
            }
            
            // Find the bookable desk by exact name match
            const deskName = `${areaName} - Platz ${deskNumber}`
            const desk = bookables.find(b => 
              b.type === 'PLACE' && b.name === deskName
            )
            
            if (!desk) {
              console.warn('Desk not found in bookables:', deskName)
            } else {
              console.log(`Mapped ${deskId} -> ${deskName} (ID: ${desk.id})`)
            }
            
            return desk?.id
          })
          .filter((id): id is number => id !== undefined)
      }
      
      if (bookableIds.length === 0) {
        showToast('Keine gültigen Buchungsziele gefunden', 'error')
        return
      }
      
      console.log('Creating booking with IDs:', bookableIds)
      
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
          date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,        }),
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
    onZonesChange(new Set())
    onDesksChange(new Set())
  }, [onZonesChange, onDesksChange])

  const handleModeChange = (m: SelectionMode) => {
    onModeChange(m)
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

    const next = new Set(zones)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
      // Auto-switch to floor mode if all 3 zones are selected
      if (next.size === 3) {
        setTimeout(() => {
          onModeChange('floor')
          resetSelection()
        }, 300)
      }
    }
    onZonesChange(next)
  }

  const onToggleDesk = (id: string) => {
    // Check if desk is booked and user is not admin
    if (bookedResources.desks.has(id) && user?.role !== 'ADMIN') {
      showToast('Platz bereits gebucht. Nur Admins können überschreiben.', 'error')
      return
    }

    const next = new Set(desks)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onDesksChange(next)
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
    <section className="flex h-full flex-col gap-2">
      {/* Admin Badge */}
      {user?.role === 'ADMIN' && (
        <div className="rounded-md bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 px-2.5 py-1.5 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800">
          <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">
            👑 Admin-Modus: Du kannst bereits gebuchte Bereiche überschreiben
          </p>
        </div>
      )}

      {/* Selection Mode Control */}
      <SelectionControl value={mode} onChange={handleModeChange} />

      {/* Time Selection */}
      <TimeSelector value={timeRange} onChange={onTimeRangeChange} />

      {/* Floor Plan Visualization */}
      <div className="relative flex-1 overflow-hidden rounded-xl border-2 border-zinc-200 bg-linear-to-br from-zinc-50 to-zinc-100 p-1.5 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-800">
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

      {/* Footer with action button and info */}
      <footer className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
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
          className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-sm"
          disabled={!hasSelection || isBooking || !user}
          onClick={handleBooking}
        >
          {isBooking ? 'Wird gebucht...' : 'Jetzt buchen'}
        </button>
      </footer>
    </section>
  )
}