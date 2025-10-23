'use client'

import * as React from 'react'

export interface TimeRange {
  start: string // HH:MM format
  end: string
}

interface TimeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

// Generate time slots (e.g., 08:00 to 18:00 in 30-minute increments)
const generateTimeSlots = () => {
  const slots: string[] = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 18 && minute === 30) break
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  return slots
}

export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  const timeSlots = generateTimeSlots()

  const handleStartChange = (start: string) => {
    onChange({ ...value, start })
    // Auto-adjust end time if it's before start
    if (value.end <= start) {
      const startIdx = timeSlots.indexOf(start)
      const newEnd = timeSlots[Math.min(startIdx + 1, timeSlots.length - 1)]
      onChange({ start, end: newEnd })
    }
  }

  const handleEndChange = (end: string) => {
    onChange({ ...value, end })
  }

  const availableEndTimes = timeSlots.filter(time => time > value.start)

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Zeitraum
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Start Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Von
          </label>
          <select
            value={value.start}
            onChange={(e) => handleStartChange(e.target.value)}
            className="w-full rounded-lg border-2 border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600"
          >
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time} Uhr
              </option>
            ))}
          </select>
        </div>

        {/* End Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Bis
          </label>
          <select
            value={value.end}
            onChange={(e) => handleEndChange(e.target.value)}
            className="w-full rounded-lg border-2 border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600"
          >
            {availableEndTimes.map((time) => (
              <option key={time} value={time}>
                {time} Uhr
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Duration Display */}
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
        <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
          Dauer: {calculateDuration(value.start, value.end)}
        </span>
      </div>
    </div>
  )
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  
  const startTotalMin = startHour * 60 + startMin
  const endTotalMin = endHour * 60 + endMin
  const diffMin = endTotalMin - startTotalMin
  
  const hours = Math.floor(diffMin / 60)
  const minutes = diffMin % 60
  
  if (hours === 0) return `${minutes} Min`
  if (minutes === 0) return `${hours} Std`
  return `${hours} Std ${minutes} Min`
}