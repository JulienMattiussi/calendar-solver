"use client";

import { PIECES, TRAY_SZ } from "@/lib/pieces";
import type { Placement } from "@/lib/solver";

interface PieceTrayProps {
  placements:    Placement[];
  activeId:      string | null;
  solving:       boolean;
  onSelectPiece: (id: string | null) => void;
  onReset:       () => void;
  onSolve:       () => void;
}

export default function PieceTray({
  placements, activeId, solving,
  onSelectPiece, onReset, onSolve,
}: PieceTrayProps) {
  const placedIds = new Set(placements.map(p => p.pieceId));

  return (
    <div className="flex flex-col gap-2 pt-1">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
        Pieces ({placements.length}/10)
      </p>

      {PIECES.map(piece => {
        const isPlaced = placedIds.has(piece.id);
        const isActive = activeId === piece.id;
        const maxR = Math.max(...piece.cells.map(c => c[0]));
        const maxC = Math.max(...piece.cells.map(c => c[1]));
        const svgW = (maxC + 1) * TRAY_SZ;
        const svgH = (maxR + 1) * TRAY_SZ;

        return (
          <button
            key={piece.id}
            disabled={isPlaced}
            onClick={() => {
              if (isPlaced) return;
              onSelectPiece(isActive ? null : piece.id);
            }}
            title={isPlaced ? "Placed" : `Select piece ${piece.id}`}
            style={{
              position: "relative",
              width: Math.max(svgW + 20, 80),
              height: Math.max(svgH + 16, 44),
              background: isPlaced
                ? "rgba(0,0,0,0.04)"
                : isActive
                  ? "rgba(139,105,20,0.18)"
                  : "rgba(255,255,255,0.65)",
              border: isActive
                ? "2px solid #8b6914"
                : "2px solid rgba(139,105,20,0.25)",
              borderRadius: 10,
              opacity: isPlaced ? 0.4 : 1,
              cursor: isPlaced ? "default" : "pointer",
              boxShadow: isActive ? "0 0 0 3px rgba(139,105,20,0.2)" : "none",
              transition: "all 0.12s",
            }}
          >
            <svg
              width={svgW} height={svgH}
              viewBox={`0 0 ${svgW} ${svgH}`}
              style={{ position: "absolute", left: 7, top: 8 }}
            >
              {piece.cells.map(([r, c], i) => (
                <rect key={i}
                  x={c * TRAY_SZ + 1} y={r * TRAY_SZ + 1}
                  width={TRAY_SZ - 2} height={TRAY_SZ - 2}
                  rx={2}
                  fill={isPlaced ? "#ccc" : piece.color}
                  stroke={isPlaced ? "#bbb" : "rgba(100,70,10,0.35)"}
                  strokeWidth={1}
                />
              ))}
            </svg>
            <span style={{
              position: "absolute", bottom: 2, right: 5,
              fontSize: 9, fontWeight: "bold",
              color: isPlaced ? "#aaa" : "#8b6914",
            }}>
              {isPlaced ? "✓" : piece.id}
            </span>
          </button>
        );
      })}

      <button
        onClick={onReset}
        style={{
          marginTop: 4, padding: "6px 0", borderRadius: 8, fontSize: 11, fontWeight: 600,
          background: "rgba(139,105,20,0.07)", border: "1px solid rgba(139,105,20,0.2)", color: "#7a5218",
          cursor: "pointer",
        }}
      >
        Reset all
      </button>

      <button
        onClick={onSolve}
        disabled={solving}
        style={{
          marginTop: 2, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: solving
            ? "rgba(139,105,20,0.1)"
            : "linear-gradient(135deg, #c8972a 0%, #a07020 100%)",
          border: "none", color: solving ? "#a08050" : "#fff",
          cursor: solving ? "default" : "pointer",
          boxShadow: solving ? "none" : "0 2px 8px rgba(139,105,20,0.35)",
          letterSpacing: "0.04em",
          transition: "all 0.15s",
        }}
      >
        {solving ? "Solving…" : "✦ Solve"}
      </button>
    </div>
  );
}
