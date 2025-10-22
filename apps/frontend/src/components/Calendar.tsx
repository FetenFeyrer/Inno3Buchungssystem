'use client';

import { useMemo, useState } from 'react';

function getDaysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function getMondayFirstDayIndex(date: Date): number {
  const sundayFirst = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return (sundayFirst + 6) % 7; // map Sunday(0) -> 6, Monday(1) -> 0
}

type CalendarProps = {
  variant?: 'card' | 'plain';
};

export function Calendar({ variant = 'card' }: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const monthIndex0 = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, monthIndex0);
  const offset = getMondayFirstDayIndex(viewDate);
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === monthIndex0 && today.getDate() === d;

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

  const cells: Array<{ key: string; label: string; isToday?: boolean }> = [];
  for (let i = 0; i < offset; i += 1) cells.push({ key: `empty-${i}`, label: '' });
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ key: `day-${d}`, label: String(d), isToday: isToday(d) });
  }

  const containerClass =
    variant === 'plain'
      ? 'w-full h-full p-4'
      : 'w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900';

  return (
    <div className={containerClass}>
      <div className="mb-3 flex items-center justify-between">
        <button
          aria-label="Vorheriger Monat"
          onClick={prevMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {/* left chevron */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 className="text-base font-semibold capitalize text-zinc-900 dark:text-zinc-100">{title}</h2>
        <button
          aria-label="Nächster Monat"
          onClick={nextMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {/* right chevron */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((d) => (
          <div key={d} className="py-1.5 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {d}
          </div>
        ))}
        {cells.map((c) => (
          <div
            key={c.key}
            className={
              c.label
                ? `flex h-10 items-center justify-center rounded-md text-sm transition-colors ${
                    c.isToday
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  }`
                : 'h-10'
            }
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;


