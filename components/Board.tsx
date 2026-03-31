"use client";

import { useId } from "react";
import { BOARD_ROWS, CELL_PX, BOARD_PAD, GRID_GAP, BOARD_BORDER } from "@/lib/board";
import { PIECES, absoluteCells, roundedRect, type RC } from "@/lib/pieces";
import type { Placement } from "@/lib/solver";

interface BoardProps {
  placements:   Placement[];
  removingIds:  Set<string>;
  coverage:     Map<string, string>;
  preview:      RC[];
  previewValid: boolean;
  month:        string;
  day:          string;
  dow:          string;
  activeId:     string | null;
  onCellClick:  (row: number, col: number) => void;
  onRightClick: (e: React.MouseEvent, row: number, col: number) => void;
  onHover:      (cell: RC | null) => void;
}

export default function Board({
  placements, removingIds, coverage, preview, previewValid,
  month, day, dow, activeId,
  onCellClick, onRightClick, onHover,
}: BoardProps) {
  const uid  = useId().replace(/:/g, "");
  const svgW = BOARD_PAD * 2 + 7 * CELL_PX + 6 * GRID_GAP;
  const svgH = BOARD_PAD * 2 + 8 * CELL_PX + 7 * GRID_GAP;
  const ext  = GRID_GAP / 2;
  const R    = 5;

  const isDateCell = (label: string) => label === month || label === day || label === dow;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #e8d5a3 0%, #d4b878 40%, #c9a84c 100%)",
        border: `${BOARD_BORDER}px solid #8b6914`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        cursor: activeId ? "crosshair" : "default",
      }}
      onMouseLeave={() => onHover(null)}
    >
      {/* SVG piece overlay — renders placed pieces as solid connected shapes */}
      <svg
        width={svgW} height={svgH}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }}
      >
        <defs>
          <filter id={`piece-shadow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.35)" />
          </filter>
        </defs>
        {placements.map(pl => {
          const piece   = PIECES.find(p => p.id === pl.pieceId)!;
          const cells   = absoluteCells(piece.cells, pl.rot, pl.flipped, pl.row, pl.col);
          const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`));
          return (
            <g
              key={pl.pieceId}
              className="piece-group"
              style={{ animation: removingIds.has(pl.pieceId) ? "piece-out 0.3s ease-in forwards" : "piece-in 0.3s cubic-bezier(0.2,0.8,0.4,1)" }}
              filter={`url(#piece-shadow-${uid})`}
            >
              {cells.map(([r, c]) => {
                const hasT = cellSet.has(`${r-1},${c}`);
                const hasB = cellSet.has(`${r+1},${c}`);
                const hasL = cellSet.has(`${r},${c-1}`);
                const hasR = cellSet.has(`${r},${c+1}`);
                const x = BOARD_PAD + c * (CELL_PX + GRID_GAP) - (hasL ? ext : 0);
                const y = BOARD_PAD + r * (CELL_PX + GRID_GAP) - (hasT ? ext : 0);
                const w = CELL_PX + (hasL ? ext : 0) + (hasR ? ext : 0);
                const h = CELL_PX + (hasT ? ext : 0) + (hasB ? ext : 0);
                return (
                  <path
                    key={`${r},${c}`}
                    d={roundedRect(x, y, w, h,
                      !hasT && !hasL ? R : 0,
                      !hasT && !hasR ? R : 0,
                      !hasB && !hasR ? R : 0,
                      !hasB && !hasL ? R : 0,
                    )}
                    fill={piece.color}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(7, ${CELL_PX}px)` }}>
        {BOARD_ROWS.map((row, ri) =>
          row.map((label, ci) => {
            if (label === null) {
              const isHole = ri === 0 && ci === 6;
              return (
                <div key={`${ri}-${ci}`} className="flex items-center justify-center"
                     style={{ width: CELL_PX, height: CELL_PX }}>
                  {isHole && (
                    <div className="rounded-full" style={{
                      width: 30, height: 30,
                      background: "radial-gradient(circle at 40% 40%, #f5f5f4 0%, #e7e5e4 40%, #6b4c1a 65%, #3a2408 100%)",
                      boxShadow: "inset 0 2px 5px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)",
                      border: "2px solid rgba(80,45,10,0.7)",
                    }} />
                  )}
                </div>
              );
            }

            const coveredBy = coverage.get(`${ri},${ci}`);
            const inPreview = preview.some(([r, c]) => r === ri && c === ci);
            const isDate    = isDateCell(label);

            const bg = coveredBy
              ? "transparent"
              : inPreview
                ? previewValid ? "rgba(110,185,110,0.55)" : "rgba(210,80,80,0.4)"
                : isDate
                  ? "rgba(100,70,10,0.1)"
                  : "linear-gradient(145deg, #f5e6c0 0%, #e8d090 50%, #d4b860 100%)";

            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => onCellClick(ri, ci)}
                onContextMenu={(e) => onRightClick(e, ri, ci)}
                onMouseEnter={() => onHover([ri, ci])}
                className="flex items-center justify-center rounded-md font-semibold text-sm transition-colors duration-75 select-none"
                style={{
                  width: CELL_PX, height: CELL_PX,
                  background: bg,
                  border: coveredBy
                    ? "none"
                    : isDate
                      ? "2px solid rgba(139,105,20,0.22)"
                      : "2px solid rgba(139,105,20,0.42)",
                  borderRadius: coveredBy ? 0 : undefined,
                  boxShadow: coveredBy
                    ? "none"
                    : isDate
                      ? "inset 0 2px 6px rgba(0,0,0,0.25)"
                      : "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
                  color: isDate ? "rgba(100,70,10,0.3)" : "#5c3d0a",
                  textShadow: (isDate || coveredBy) ? "none" : "0 1px 0 rgba(255,255,255,0.4)",
                  letterSpacing: "0.02em",
                  cursor: activeId ? "crosshair" : "pointer",
                }}
              >
                {coveredBy ? null : label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
