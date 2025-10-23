'use client'

import * as React from 'react'
import clsx from 'clsx'

export type ZoneId = 'zone-1' | 'zone-2' | 'zone-3'
export type SelectionMode = 'floor' | 'zone' | 'desk'

export type FloorPlanSVGProps = {
  mode: SelectionMode
  selectedZones: Set<ZoneId>
  selectedDesks: Set<string>
  onSelectFloor: () => void
  onToggleZone: (id: ZoneId) => void
  onToggleDesk: (id: string) => void
  className?: string
}

const VB_WIDTH = 1600
const VB_HEIGHT = 900

// Main floor dimensions
const floorX = 150
const floorY = 120
const floorW = VB_WIDTH - 300
const floorH = VB_HEIGHT - 240

// Zone dimensions
const zoneGap = 40
const zoneW = (floorW - zoneGap * 4) / 3
const zoneH = floorH - 80
const zoneY = floorY + 40
const zoneXs = [
  floorX + zoneGap,
  floorX + zoneGap + zoneW + zoneGap,
  floorX + zoneGap + (zoneW + zoneGap) * 2
] as const

// Desk layout
const DESK_ROWS = 4
const DESK_COLS = 5
const DESK_W = 50
const DESK_H = 40
const DESK_GAP = 20

function zoneIdByIndex(i: number): ZoneId {
  return (['zone-1', 'zone-2', 'zone-3'] as const)[i]
}

export default function FloorPlanSVG({
  mode,
  selectedZones,
  selectedDesks,
  onSelectFloor,
  onToggleZone,
  onToggleDesk,
  className,
}: FloorPlanSVGProps) {
  return (
    <div className={clsx('relative select-none', className)}>
      <svg
        role="img"
        aria-label="Stockwerkübersicht"
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background rectangle - darker blue, extends beyond main floor */}
        <rect
          x={50}
          y={floorY}
          width={VB_WIDTH - 100}
          height={floorH}
          fill="#bfdbfe"
          rx={24}
        />

        {/* Terrace label (left) */}
        <text
          x={100}
          y={floorY + floorH / 2}
          textAnchor="middle"
          fontSize={14}
          fontWeight="600"
          fill="#71717a"
          opacity={0.5}
          transform={`rotate(-90 100, ${floorY + floorH / 2})`}
        >
          Terrasse
        </text>

        {/* Balcony label (right) */}
        <text
          x={VB_WIDTH - 100}
          y={floorY + floorH / 2}
          textAnchor="middle"
          fontSize={14}
          fontWeight="600"
          fill="#71717a"
          opacity={0.5}
          transform={`rotate(-90 ${VB_WIDTH - 100}, ${floorY + floorH / 2})`}
        >
          Balkon
        </text>

        {/* Main floor rectangle (interior - selectable area) */}
        <rect
          x={floorX}
          y={floorY}
          width={floorW}
          height={floorH}
          fill={mode === 'floor' ? '#3b82f6' : 'transparent'}
          fillOpacity={mode === 'floor' ? 0.15 : 0}
          rx={20}
          cursor={mode === 'floor' ? 'pointer' : 'default'}
          onClick={() => mode === 'floor' && onSelectFloor()}
          onKeyDown={(e) => {
            if (mode === 'floor' && (e.key === 'Enter' || e.key === ' ')) onSelectFloor()
          }}
          style={{
            filter: mode === 'floor' 
              ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))' 
              : 'none',
            transition: 'all 0.3s ease',
          }}
        />

        {/* Title */}
        <text
          x={VB_WIDTH / 2}
          y={70}
          textAnchor="middle"
          fontSize={32}
          fontWeight="700"
          fill="#18181b"
        >
          Stockwerk 3
        </text>

        {/* Three zone rectangles */}
        {zoneXs.map((zx, i) => {
          const id = zoneIdByIndex(i)
          const selected = selectedZones.has(id)

          return (
            <g key={id} aria-label={`Bereich ${i + 1}`} tabIndex={mode === 'zone' ? 0 : -1}>
              {/* Zone card */}
              <rect
                x={zx}
                y={zoneY}
                width={zoneW}
                height={zoneH}
                fill="white"
                stroke={selected ? 'none' : '#e5e7eb'}
                strokeWidth={selected ? 0 : 2}
                rx={16}
                cursor={mode === 'zone' ? 'pointer' : 'default'}
                onClick={() => mode === 'zone' && onToggleZone(id)}
                onKeyDown={(e) => {
                  if (mode === 'zone' && (e.key === 'Enter' || e.key === ' ')) onToggleZone(id)
                }}
                style={{
                  filter: selected 
                    ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))' 
                    : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))',
                  transition: 'all 0.3s ease',
                }}
              />

              {/* Zone label */}
              <text
                x={zx + zoneW / 2}
                y={zoneY + 45}
                textAnchor="middle"
                fontSize={20}
                fontWeight="700"
                fill={selected ? '#3b82f6' : '#71717a'}
                pointerEvents="none"
              >
                Bereich {i + 1}
              </text>

              {/* Desk count */}
              {mode !== 'desk' && (
                <text
                  x={zx + zoneW / 2}
                  y={zoneY + zoneH - 35}
                  textAnchor="middle"
                  fontSize={14}
                  fill="#a1a1aa"
                  pointerEvents="none"
                >
                  {DESK_ROWS * DESK_COLS} Arbeitsplätze
                </text>
              )}

              {/* Desk grid */}
              {mode === 'desk' && (
                <g>
                  {Array.from({ length: DESK_ROWS }).map((_, r) =>
                    Array.from({ length: DESK_COLS }).map((__, c) => {
                      const totalWidth = DESK_COLS * DESK_W + (DESK_COLS - 1) * DESK_GAP
                      const totalHeight = DESK_ROWS * DESK_H + (DESK_ROWS - 1) * DESK_GAP
                      const startX = zx + (zoneW - totalWidth) / 2
                      const startY = zoneY + 80

                      const dx = startX + c * (DESK_W + DESK_GAP)
                      const dy = startY + r * (DESK_H + DESK_GAP)
                      const deskId = `desk-${id}-${r}-${c}`
                      const isSel = selectedDesks.has(deskId)

                      return (
                        <g key={deskId}>
                          <rect
                            x={dx}
                            y={dy}
                            width={DESK_W}
                            height={DESK_H}
                            rx={8}
                            fill={isSel ? '#3b82f6' : '#f4f4f5'}
                            stroke={isSel ? 'none' : '#e5e7eb'}
                            strokeWidth={isSel ? 0 : 1}
                            cursor="pointer"
                            onClick={() => onToggleDesk(deskId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') onToggleDesk(deskId)
                            }}
                            tabIndex={0}
                            style={{
                              filter: isSel 
                                ? 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))' 
                                : 'none',
                              transition: 'all 0.2s ease',
                            }}
                          />
                          {isSel && (
                            <text
                              x={dx + DESK_W / 2}
                              y={dy + DESK_H / 2 + 7}
                              textAnchor="middle"
                              fontSize={20}
                              fontWeight="700"
                              fill="white"
                              pointerEvents="none"
                            >
                              ✓
                            </text>
                          )}
                        </g>
                      )
                    })
                  )}
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}