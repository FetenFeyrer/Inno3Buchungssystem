'use client'

import * as React from 'react'
import clsx from 'clsx'

export type ZoneId = 'zone-1' | 'zone-2' | 'zone-3'
export type SelectionMode = 'floor' | 'zone' | 'desk'

export type FloorPlanSVGProps = {
  mode: SelectionMode
  selectedZones: Set<ZoneId>
  selectedDesks: Set<string>
  bookedZones: Set<ZoneId>
  bookedDesks: Set<string>
  isFloorBooked: boolean
  isAdmin?: boolean
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

// Desk layout - ONLY in zone-1 (Terrasse area)
const DESK_ROWS = 2  // 2 rows
const DESK_COLS = 5  // 5 columns = 10 desks total
const DESK_W = 50
const DESK_H = 40
const DESK_GAP = 20

function zoneIdByIndex(i: number): ZoneId {
  return (['zone-1', 'zone-2', 'zone-3'] as const)[i]
}

// Zone has desks only if it's zone-1
function zoneHasDesks(zoneId: ZoneId): boolean {
  return zoneId === 'zone-1'
}

export default function FloorPlanSVG({
  mode,
  selectedZones,
  selectedDesks,
  bookedZones,
  bookedDesks,
  isFloorBooked,
  isAdmin,
  onSelectFloor,
  onToggleZone,
  onToggleDesk,
  className,
}: FloorPlanSVGProps) {
  
  const getZoneColor = (zoneId: ZoneId, isSelected: boolean) => {
    const isBooked = bookedZones.has(zoneId)
    
    if (isSelected) {
      return isBooked && !isAdmin ? '#ef4444' : '#3b82f6' // red if booked, blue if selected
    }
    
    if (isBooked) {
      return 'white' // Keep white background
    }
    
    return 'white'
  }

  const getZoneStroke = (zoneId: ZoneId, isSelected: boolean) => {
    const isBooked = bookedZones.has(zoneId)
    
    if (isBooked && !isSelected) {
      return { stroke: '#ef4444', strokeWidth: 3 }
    }
    
    if (isSelected) {
      return { stroke: 'none', strokeWidth: 0 }
    }
    
    return { stroke: '#e5e7eb', strokeWidth: 2 }
  }

  const getDeskColor = (deskId: string, isSelected: boolean) => {
    const isBooked = bookedDesks.has(deskId)
    
    if (isSelected) {
      return isBooked && !isAdmin ? '#ef4444' : '#3b82f6'
    }
    
    if (isBooked) {
      return '#fecaca' // Light red for booked
    }
    
    return '#f4f4f5'
  }

  const getDeskStroke = (deskId: string, isSelected: boolean) => {
    const isBooked = bookedDesks.has(deskId)
    
    if (isBooked && !isSelected) {
      return { stroke: '#ef4444', strokeWidth: 2 }
    }
    
    if (isSelected) {
      return { stroke: 'none', strokeWidth: 0 }
    }
    
    return { stroke: '#e5e7eb', strokeWidth: 1 }
  }

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
          Terasse
        </text>

        {/* Main floor rectangle (interior - selectable area) */}
        <rect
          x={floorX}
          y={floorY}
          width={floorW}
          height={floorH}
          fill={mode === 'floor' ? (isFloorBooked && !isAdmin ? '#ef4444' : '#3b82f6') : 'transparent'}
          fillOpacity={mode === 'floor' ? 0.15 : 0}
          stroke={isFloorBooked && mode !== 'floor' ? '#ef4444' : 'none'}
          strokeWidth={isFloorBooked && mode !== 'floor' ? 4 : 0}
          rx={20}
          cursor={mode === 'floor' ? 'pointer' : 'default'}
          onClick={() => mode === 'floor' && onSelectFloor()}
          onKeyDown={(e) => {
            if (mode === 'floor' && (e.key === 'Enter' || e.key === ' ')) onSelectFloor()
          }}
          style={{
            filter: mode === 'floor' 
              ? `drop-shadow(0 0 20px ${isFloorBooked && !isAdmin ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)'})` 
              : 'none',
            transition: 'all 0.3s ease',
          }}
        />

        {/* Floor booked indicator */}
        {isFloorBooked && mode !== 'floor' && (
          <text
            x={VB_WIDTH / 2}
            y={floorY - 20}
            textAnchor="middle"
            fontSize={16}
            fontWeight="700"
            fill="#ef4444"
          >
            🔒 Stockwerk gebucht {!isAdmin && '(Nur Admin)'}
          </text>
        )}

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
          const isBooked = bookedZones.has(id)
          const hasDesks = zoneHasDesks(id)
          const strokeProps = getZoneStroke(id, selected)
          const zoneName = ['Terasse', 'Mitte', 'Balkon'][i]

          return (
            <g key={id} aria-label={`Bereich ${zoneName}`} tabIndex={mode === 'zone' ? 0 : -1}>
              {/* Zone card */}
              <rect
                x={zx}
                y={zoneY}
                width={zoneW}
                height={zoneH}
                fill={getZoneColor(id, selected)}
                stroke={strokeProps.stroke}
                strokeWidth={strokeProps.strokeWidth}
                rx={16}
                cursor={mode === 'zone' ? 'pointer' : 'default'}
                onClick={() => mode === 'zone' && onToggleZone(id)}
                onKeyDown={(e) => {
                  if (mode === 'zone' && (e.key === 'Enter' || e.key === ' ')) onToggleZone(id)
                }}
                style={{
                  filter: selected 
                    ? `drop-shadow(0 0 20px ${isBooked && !isAdmin ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)'})` 
                    : isBooked 
                    ? 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
                    : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))',
                  transition: 'all 0.3s ease',
                }}
              />

              {/* Booked indicator */}
              {isBooked && !selected && (
                <text
                  x={zx + zoneW / 2}
                  y={zoneY + 30}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="700"
                  fill="#ef4444"
                  pointerEvents="none"
                >
                  🔒 {isAdmin ? 'Gebucht (Override möglich)' : 'Gebucht'}
                </text>
              )}

              {/* Zone label */}
              <text
                x={zx + zoneW / 2}
                y={zoneY + (isBooked && !selected ? 55 : 45)}
                textAnchor="middle"
                fontSize={20}
                fontWeight="700"
                fill={selected ? (isBooked && !isAdmin ? 'white' : 'white') : isBooked ? '#ef4444' : '#71717a'}
                pointerEvents="none"
              >
                {zoneName}
              </text>

              {/* Desk count or zone-only info */}
              {mode !== 'desk' && (
                <text
                  x={zx + zoneW / 2}
                  y={zoneY + zoneH - 35}
                  textAnchor="middle"
                  fontSize={14}
                  fill={selected ? 'white' : '#a1a1aa'}
                  pointerEvents="none"
                >
                  {hasDesks ? `${DESK_ROWS * DESK_COLS} Arbeitsplätze` : 'Nur als Ganzes buchbar'}
                </text>
              )}

              {/* Desk grid - ONLY for zone-1 */}
              {mode === 'desk' && hasDesks && (
                <g>
                  {Array.from({ length: DESK_ROWS }).map((_, r) =>
                    Array.from({ length: DESK_COLS }).map((__, c) => {
                      const totalWidth = DESK_COLS * DESK_W + (DESK_COLS - 1) * DESK_GAP
                      const totalHeight = DESK_ROWS * DESK_H + (DESK_ROWS - 1) * DESK_GAP
                      const startX = zx + (zoneW - totalWidth) / 2
                      const startY = zoneY + (zoneH - totalHeight) / 2

                      const dx = startX + c * (DESK_W + DESK_GAP)
                      const dy = startY + r * (DESK_H + DESK_GAP)
                      const deskId = `desk-${id}-${r}-${c}`
                      const deskNumber = r * DESK_COLS + c + 1
                      const isSel = selectedDesks.has(deskId)
                      const isDeskBooked = bookedDesks.has(deskId)
                      const strokeProps = getDeskStroke(deskId, isSel)

                      return (
                        <g key={deskId}>
                          <rect
                            x={dx}
                            y={dy}
                            width={DESK_W}
                            height={DESK_H}
                            rx={8}
                            fill={getDeskColor(deskId, isSel)}
                            stroke={strokeProps.stroke}
                            strokeWidth={strokeProps.strokeWidth}
                            cursor="pointer"
                            onClick={() => onToggleDesk(deskId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') onToggleDesk(deskId)
                            }}
                            tabIndex={0}
                            style={{
                              filter: isSel 
                                ? `drop-shadow(0 0 12px ${isDeskBooked && !isAdmin ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'})` 
                                : isDeskBooked
                                ? 'drop-shadow(0 1px 3px rgba(239, 68, 68, 0.4))'
                                : 'none',
                              transition: 'all 0.2s ease',
                            }}
                          />
                          
                          {/* Desk number */}
                          <text
                            x={dx + DESK_W / 2}
                            y={dy + DESK_H / 2 - 5}
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight="600"
                            fill={isSel ? 'white' : isDeskBooked ? '#ef4444' : '#71717a'}
                            pointerEvents="none"
                          >
                            #{deskNumber}
                          </text>
                          
                          {isSel && (
                            <text
                              x={dx + DESK_W / 2}
                              y={dy + DESK_H / 2 + 12}
                              textAnchor="middle"
                              fontSize={18}
                              fontWeight="700"
                              fill="white"
                              pointerEvents="none"
                            >
                              ✓
                            </text>
                          )}
                          {isDeskBooked && !isSel && (
                            <text
                              x={dx + DESK_W / 2}
                              y={dy + DESK_H / 2 + 12}
                              textAnchor="middle"
                              fontSize={16}
                              fontWeight="700"
                              fill="#ef4444"
                              pointerEvents="none"
                            >
                              🔒
                            </text>
                          )}
                        </g>
                      )
                    })
                  )}
                </g>
              )}

              {/* Message for zones without desks in desk mode */}
              {mode === 'desk' && !hasDesks && (
                <text
                  x={zx + zoneW / 2}
                  y={zoneY + zoneH / 2}
                  textAnchor="middle"
                  fontSize={16}
                  fill="#a1a1aa"
                  pointerEvents="none"
                >
                  Keine Einzelplätze
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90">
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded border-2 border-blue-500 bg-blue-500" />
            <span className="text-zinc-700 dark:text-zinc-300">Ausgewählt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded border-2 border-red-500 bg-red-200" />
            <span className="text-zinc-700 dark:text-zinc-300">Gebucht</span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">👑 Admin-Override aktiv</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}