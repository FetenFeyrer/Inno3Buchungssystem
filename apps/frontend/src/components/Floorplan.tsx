'use client';

type Area = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  baseColor: string;
  hoverColor: string;
};

const AREAS: Area[] = [
  { id: 'balkon', label: 'Balkon', x: 8, y: 8, width: 84, height: 28, baseColor: '#e5e7eb', hoverColor: '#93c5fd' },
  { id: 'mitte', label: 'Mitte', x: 8, y: 40, width: 84, height: 28, baseColor: '#e5e7eb', hoverColor: '#a7f3d0' },
  { id: 'hinten', label: 'Hinten', x: 8, y: 72, width: 84, height: 20, baseColor: '#e5e7eb', hoverColor: '#fde68a' },
];

export default function Floorplan() {
  return (
    <div className="w-full rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Grundriss (Demo)</h2>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">3 Bereiche</span>
      </div>
      <svg
        viewBox="0 0 100 100"
        className="h-72 w-full rounded-md bg-zinc-100 dark:bg-zinc-800"
        role="img"
        aria-label="Einfacher Grundriss in drei Bereiche"
      >
        <rect x="4" y="4" width="92" height="92" rx="2" ry="2" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="0.5" />

        {AREAS.map((a) => (
          <g key={a.id}>
            <rect
              x={a.x}
              y={a.y}
              width={a.width}
              height={a.height}
              rx={1.5}
              ry={1.5}
              className="transition-colors"
              style={{ fill: a.baseColor }}
            >
              <title>{a.label}</title>
            </rect>
            <rect
              x={a.x}
              y={a.y}
              width={a.width}
              height={a.height}
              rx={1.5}
              ry={1.5}
              fill="transparent"
              className="cursor-pointer"
            />
            <text
              x={a.x + a.width / 2}
              y={a.y + a.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none text-[3px] fill-zinc-700 dark:fill-zinc-200"
            >
              {a.label}
            </text>
            <style>{`
              g:hover rect:first-of-type { fill: ${a.hoverColor}; }
            `}</style>
          </g>
        ))}
      </svg>
    </div>
  );
}


