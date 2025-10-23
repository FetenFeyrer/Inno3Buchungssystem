'use client';

import { useMemo, useState, useEffect } from 'react';

type CalendarProps = {
  variant?: 'card' | 'plain';
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
};

export function Calendar({ variant = 'card', selectedDate: externalSelectedDate, onDateChange }: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const year = viewDate.getFullYear();
  const monthIndex0 = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, monthIndex0);
  const offset = getMondayFirstDayIndex(viewDate);
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === monthIndex0 && today.getDate() === d;
  const isSelected = (d: number) => selectedDay === d && viewDate.getMonth() === monthIndex0 && viewDate.getFullYear() === year;

  const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }),
    []
  );
  const title = monthFormatter.format(viewDate);

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    setSelectedDay(day);
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onDateChange?.(newDate);
  };

  const cells: Array<{ key: string; label: string; day: number | null; isToday?: boolean }> = [];
  for (let i = 0; i < offset; i += 1) cells.push({ key: `empty-${i}`, label: '', day: null });
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ key: `day-${d}`, label: String(d), day: d, isToday: isToday(d) });
  }

  const containerClass =
    variant === 'plain'
      ? 'w-full h-full p-3'
      : 'w-full rounded-xl border border-zinc-200/60 bg-white p-3 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/90';

  return (
    <div className={containerClass}>
      {/* ... existing header code ... */}
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            aria-label="Vorheriger Monat"
            onClick={prevMonth}
            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <svg className="transition-transform group-hover:-translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h2 className="text-xs font-bold capitalize tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <button
            aria-label="Nächster Monat"
            onClick={nextMonth}
            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <svg className="transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        
        <div className="rounded-md bg-linear-to-r from-blue-50 to-indigo-50 p-2 dark:from-blue-950/30 dark:to-indigo-950/30">
          <p className="text-[10px] font-medium text-blue-900 dark:text-blue-100">
            Heute: {today.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((d) => (
          <div key={d} className="pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {d}
          </div>
        ))}
        {cells.map((c) => (
          <button
            key={c.key}
            onClick={() => c.day && handleDateClick(c.day)}
            disabled={!c.label}
            className={
              c.label
                ? `group relative flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    c.isToday
                      ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40'
                      : isSelected(c.day!)
                      ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-500 dark:bg-blue-900/30 dark:text-blue-100'
                      : 'text-zinc-800 hover:bg-zinc-100 hover:scale-105 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  }`
                : 'h-8'
            }
          >
            {c.label && (
              <>
                <span className="relative z-10">{c.label}</span>
                {!c.isToday && !isSelected(c.day!) && (
                  <div className="absolute inset-0 rounded-lg bg-linear-to-br from-blue-500/0 to-purple-500/0 opacity-0 transition-opacity group-hover:from-blue-500/10 group-hover:to-purple-500/10 group-hover:opacity-100" />
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-3 border-t border-zinc-200/60 pt-2 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-linear-to-br from-blue-500 to-blue-600"></div>
          <span className="text-[10px] text-zinc-600 dark:text-zinc-400">Heute</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900/30"></div>
          <span className="text-[10px] text-zinc-600 dark:text-zinc-400">Ausgewählt</span>
        </div>
      </div>
    </div>
  );
}

// Keep these helper functions
function getDaysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function getMondayFirstDayIndex(date: Date): number {
  const sundayFirst = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return (sundayFirst + 6) % 7;
}

export default Calendar;