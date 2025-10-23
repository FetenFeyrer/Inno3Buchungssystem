'use client'

import * as React from 'react'
import Calendar from '@/components/Calendar'
import Floorplan from '@/components/Floorplan'
import BookingTimeline, { Booking } from '@/components/BookingTimeline'
import type { SelectionMode, ZoneId } from '@/components/FloorPlanSVG'
import type { TimeRange } from '@/components/TimeSelector'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

type Bookable = {
  id: number
  name: string
  type: 'FLOOR' | 'AREA' | 'PLACE'
}

export default function Page() {
  const [mounted, setMounted] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  // Shared state for BookingTimeline
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [mode, setMode] = React.useState<SelectionMode>('zone')
  const [zones, setZones] = React.useState<Set<ZoneId>>(new Set())
  const [desks, setDesks] = React.useState<Set<string>>(new Set())
  const [timeRange, setTimeRange] = React.useState<TimeRange>({
    start: '09:00',
    end: '17:00'
  })
  
  // Stats data
  const [bookables, setBookables] = React.useState<Bookable[]>([])
  const [allBookings, setAllBookings] = React.useState<any[]>([])
  const [monthlyBookings, setMonthlyBookings] = React.useState<any[]>([])

  React.useEffect(() => {
    setMounted(true)
    fetchBookables()
  }, [])
  
  // Fetch all bookings when date changes
  React.useEffect(() => {
    if (selectedDate) {
      fetchAllBookings(selectedDate)
      fetchMonthlyBookings(selectedDate)
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
    }
  }
  
  const fetchAllBookings = async (date: Date) => {
    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const response = await fetch(`/api/bookings?date=${dateStr}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setAllBookings(data)
    } catch (error) {
      console.error('Error fetching all bookings:', error)
    }
  }
  
  const fetchMonthlyBookings = async (date: Date) => {
    try {
      // Fetch bookings for the entire month
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // Fetch all bookings for all days in the month
      const bookingsPromises = []
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        bookingsPromises.push(
          fetch(`/api/bookings?date=${dateStr}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => ({ date: dateStr, bookings: data }))
            .catch(() => ({ date: dateStr, bookings: [] }))
        )
      }
      
      const results = await Promise.all(bookingsPromises)
      const allMonthBookings = results.flatMap(r => 
        r.bookings.map((b: any) => ({ ...b, date: r.date }))
      )
      setMonthlyBookings(allMonthBookings)
    } catch (error) {
      console.error('Error fetching monthly bookings:', error)
    }
  }
  
  // Calculate booking status for each day in the calendar
  const dayBookingStatus = React.useMemo(() => {
    const statusMap = new Map<string, 'full' | 'partial' | 'available'>()
    
    // Group bookings by date
    const bookingsByDate = new Map<string, any[]>()
    monthlyBookings.forEach(booking => {
      const dateStr = booking.date
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, [])
      }
      bookingsByDate.get(dateStr)!.push(booking)
    })
    
    // Calculate status for each date
    bookingsByDate.forEach((dayBookings, dateStr) => {
      // Check if entire floor is booked
      const floorBookings = dayBookings.filter(b => b.bookable.type === 'FLOOR')
      
      if (floorBookings.length > 0) {
        // Calculate total hours the floor is booked
        let totalFloorHours = 0
        floorBookings.forEach(booking => {
          const start = new Date(booking.start)
          const end = new Date(booking.end)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          totalFloorHours += hours
        })
        
        if (totalFloorHours > 4) {
          statusMap.set(dateStr, 'full')
          return
        }
      }
      
      // Check if there are any bookings (partial)
      if (dayBookings.length > 0) {
        statusMap.set(dateStr, 'partial')
      } else {
        statusMap.set(dateStr, 'available')
      }
    })
    
    return statusMap
  }, [monthlyBookings])
  
  // Calculate statistics
  const stats = React.useMemo(() => {
    // Count available places (desks/places only)
    const totalPlaces = bookables.filter(b => b.type === 'PLACE').length
    
    // Count booked places
    const bookedPlaceIds = new Set<number>()
    allBookings.forEach(booking => {
      if (booking.bookable.type === 'PLACE') {
        bookedPlaceIds.add(booking.bookableId)
      }
    })
    
    const availablePlaces = totalPlaces - bookedPlaceIds.size
    
    // Count user's active bookings (all bookings, not just today)
    const userBookings = user ? allBookings.filter(b => b.userId === user.id).length : 0
    
    // Get unique colleagues on-site today
    const uniqueUsers = new Set<string>()
    allBookings.forEach(booking => {
      if (booking.user && booking.user.name) {
        uniqueUsers.add(booking.user.name)
      }
    })
    const colleaguesCount = uniqueUsers.size
    
    // Get next booking time for user
    let nextBooking = null
    if (user) {
      const userBookingsList = allBookings
        .filter(b => b.userId === user.id)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      
      if (userBookingsList.length > 0) {
        const next = userBookingsList[0]
        const startDate = new Date(next.start)
        nextBooking = startDate.toLocaleString('de-DE', { 
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
    
    return {
      availablePlaces,
      totalPlaces,
      userBookings,
      colleaguesCount,
      uniqueUsers: Array.from(uniqueUsers).slice(0, 4),
      nextBooking
    }
  }, [bookables, allBookings, user])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="mx-auto h-full max-w-full p-3 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Wird geladen...</p>
        </div>
      </main>
    )
  }
  
  // Don't render content if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <main className="mx-auto h-full max-w-full p-3 flex flex-col">
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
            dayBookingStatus={dayBookingStatus}
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

        {/* Right Column – Booking Timeline & Stats */}
        <div
          className={`lg:col-span-4 flex flex-col gap-3 transition-all duration-700 delay-300 overflow-y-auto ${
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
          
          {/* Statistics Cards */}
          <div className="space-y-2">
            {/* Stats Header */}
            <div className="rounded-xl border border-zinc-200/60 bg-linear-to-br from-white to-zinc-50 p-2.5 shadow-sm dark:border-zinc-800/60 dark:from-zinc-900/90 dark:to-zinc-900/50">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Übersicht
              </h3>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* Stat Card 1 - Available Places */}
            <div className="group rounded-lg border border-zinc-200/60 bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/90">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.availablePlaces}</p>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Verfügbare Plätze</p>
                </div>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div 
                  className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600"
                  style={{ width: `${stats.totalPlaces > 0 ? (stats.availablePlaces / stats.totalPlaces) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Stat Card 2 - User's Bookings */}
            <div className="group rounded-lg border border-zinc-200/60 bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/90">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.userBookings}</p>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Deine Buchungen</p>
                </div>
              </div>
              {stats.nextBooking && (
                <div className="mt-2">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Nächste: {stats.nextBooking}</p>
                </div>
              )}
            </div>

            {/* Stat Card 3 - Colleagues */}
            <div className="group rounded-lg border border-zinc-200/60 bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/90">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.colleaguesCount}</p>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Kollegen vor Ort</p>
                </div>
              </div>
              {stats.uniqueUsers.length > 0 && (
                <div className="mt-2 flex -space-x-1.5">
                  {stats.uniqueUsers.map((name, i) => (
                    <div
                      key={i}
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-semibold text-white border-2 border-white dark:border-zinc-900 ${
                        ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][i % 4]
                      }`}
                      title={name}
                    >
                      {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  ))}
                  {stats.colleaguesCount > 4 && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 border-2 border-white text-[8px] font-semibold text-zinc-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-300">
                      +{stats.colleaguesCount - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}