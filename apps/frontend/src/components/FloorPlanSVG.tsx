'use client';

import React from "react";

/**
 * FloorPlanSVG – stark vereinfachte, stilisierte Darstellung
 * - Zeigt NUR die äußeren Wände als Rahmen
 * - Großen Raum in 3 vertikale Bereiche geteilt, einzeln klick-/fokussierbar
 * - Perfekt zum Einbinden in Next.js/React
 */

export type ZoneId = "zone-1" | "zone-2" | "zone-3";

export default function FloorPlanSVG({
  selected,
  onSelect,
  className,
}: {
  selected?: ZoneId | null;
  onSelect?: (zone: ZoneId) => void;
  className?: string;
}) {
  // Maße sind absichtlich einfach gehalten (stilisierte SVG)
  // viewBox ist skalierbar und bleibt responsiv
  const wallThickness = 28; // Stärke der Außenwand in SVG-Einheiten
  const cornerRadius = 36; // leichte Rundung an den Ecken – wirkt moderner

  // Gesamtfläche
  const width = 1200;
  const height = 650;

  // Innenfläche des großen Raums (innenliegend, innerhalb der Außenwände)
  const innerPadding = wallThickness + 18; // kleiner Abstand zur Außenwand
  const innerX = innerPadding;
  const innerY = innerPadding;
  const innerW = width - innerPadding * 2;
  const innerH = height - innerPadding * 2;

  // Drei vertikale Zonen
  const zoneW = innerW / 3;

  // Hilfsfunktion für Zustandsstil
  const zoneStyle = (id: ZoneId) => ({
    fill:
      selected === id
        ? "#f59e0b55" // ausgewählt (bernstein-transparent)
        : "#0ea5e91a", // normal (cyan-transparent)
    stroke: selected === id ? "#f59e0b" : "#0ea5e9",
    strokeWidth: 2,
  });

  const handleSelect = (id: ZoneId) => () => onSelect?.(id);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Stilisierter Grundriss – drei klickbare Bereiche"
    >
      {/* Transparentes SVG: kein Hintergrund-Rechteck */}

      {/* Äußere Wände: dicker Rahmen */}
      <rect
        x={wallThickness / 2}
        y={wallThickness / 2}
        width={width - wallThickness}
        height={height - wallThickness}
        rx={cornerRadius}
        ry={cornerRadius}
        fill="none"
        stroke="#111827"
        strokeWidth={wallThickness}
      />

      {/* Innere Großraum-Fläche (nur als Kontur, optional sichtbar) */}
      <rect
        x={innerX}
        y={innerY}
        width={innerW}
        height={innerH}
        fill="none"
        stroke="#9ca3af"
        strokeWidth={1.5}
        strokeDasharray="6 8"
      />

      {/* Trennlinien (nur visuell); Interaktion läuft über die darunterliegenden Zonen-<rect>s */}
      <line
        x1={innerX + zoneW}
        y1={innerY}
        x2={innerX + zoneW}
        y2={innerY + innerH}
        stroke="#9ca3af"
        strokeWidth={2}
        strokeDasharray="4 6"
      />
      <line
        x1={innerX + zoneW * 2}
        y1={innerY}
        x2={innerX + zoneW * 2}
        y2={innerY + innerH}
        stroke="#9ca3af"
        strokeWidth={2}
        strokeDasharray="4 6"
      />

      {/* Interaktive Zonen */}
      <g id="zones" aria-label="Auswahlbereiche">
        <rect
          id="zone-1"
          x={innerX}
          y={innerY}
          width={zoneW}
          height={innerH}
          {...zoneStyle("zone-1")}
          tabIndex={0}
          role="button"
          aria-label="Bereich 1"
          onClick={handleSelect("zone-1")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleSelect("zone-1")();
          }}
        />
        <rect
          id="zone-2"
          x={innerX + zoneW}
          y={innerY}
          width={zoneW}
          height={innerH}
          {...zoneStyle("zone-2")}
          tabIndex={0}
          role="button"
          aria-label="Bereich 2"
          onClick={handleSelect("zone-2")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleSelect("zone-2")();
          }}
        />
        <rect
          id="zone-3"
          x={innerX + zoneW * 2}
          y={innerY}
          width={zoneW}
          height={innerH}
          {...zoneStyle("zone-3")}
          tabIndex={0}
          role="button"
          aria-label="Bereich 3"
          onClick={handleSelect("zone-3")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleSelect("zone-3")();
          }}
        />
      </g>

      {/* Labels (optional) */}
      <g fontFamily="ui-sans-serif, system-ui" fontSize={20} fill="#374151">
        <text x={innerX + zoneW / 2} y={innerY + 32} textAnchor="middle">
          1
        </text>
        <text x={innerX + zoneW * 1.5} y={innerY + 32} textAnchor="middle">
          2
        </text>
        <text x={innerX + zoneW * 2.5} y={innerY + 32} textAnchor="middle">
          3
        </text>
      </g>

      {/* Fokus-/Hover-Feedback per CSS-in-SVG */}
      <style>{`
        #zones rect { cursor: pointer; transition: opacity .2s ease; }
        #zones rect:hover { opacity: .9; }
        #zones rect:focus { outline: none; filter: drop-shadow(0 0 0.5rem rgba(0,0,0,0.2)); }
      `}</style>
    </svg>
  );
}


