"use client";

import { PIECES, TRAY_SZ, transform, type Rot } from "@/lib/pieces";
import type { Placement } from "@/lib/solver";

interface PieceTrayProps {
  placements: Placement[];
  activeId: string | null;
  solving: boolean;
  rotation: Rot;
  flipped: boolean;
  onSelectPiece: (id: string | null) => void;
  onRotate: () => void;
  onFlip: () => void;
  onCancel: () => void;
  onReset: () => void;
  onSolve: () => void;
}

const PREVIEW_CELL = 26;

export default function PieceTray({
  placements,
  activeId,
  solving,
  rotation,
  flipped,
  onSelectPiece,
  onRotate,
  onFlip,
  onCancel,
  onReset,
  onSolve,
}: PieceTrayProps) {
  const placedIds = new Set(placements.map((p) => p.pieceId));

  // ── Mobile active-piece panel ──────────────────────────────────────────────
  const activePieceData = activeId ? PIECES.find((p) => p.id === activeId) : null;
  let activePiecePanel: React.ReactNode = null;

  if (activePieceData) {
    const cells = transform(activePieceData.cells, rotation, flipped);
    const maxR = Math.max(...cells.map((c) => c[0]));
    const maxC = Math.max(...cells.map((c) => c[1]));
    const svgW = (maxC + 1) * PREVIEW_CELL;
    const svgH = (maxR + 1) * PREVIEW_CELL;

    const btnStyle: React.CSSProperties = {
      padding: "8px 16px",
      borderRadius: 10,
      border: "1.5px solid rgba(139,105,20,0.3)",
      background: "rgba(139,105,20,0.09)",
      color: "#7a5218",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      letterSpacing: "0.02em",
    };

    activePiecePanel = (
      <div
        className="md:hidden flex flex-col items-center gap-2 py-2"
        style={{
          background: "linear-gradient(135deg, #fdf8f0 0%, #f5ead8 100%)",
          border: "1.5px solid rgba(139,105,20,0.2)",
          borderRadius: 14,
          padding: "12px 16px",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#a07830",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Piece {activeId} — drag on board · lift to place
        </p>

        {/* Large piece preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 60,
          }}
        >
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ display: "block" }}
          >
            {cells.map(([r, c], i) => (
              <rect
                key={i}
                x={c * PREVIEW_CELL + 1}
                y={r * PREVIEW_CELL + 1}
                width={PREVIEW_CELL - 2}
                height={PREVIEW_CELL - 2}
                rx={4}
                fill={activePieceData.color}
                stroke="rgba(100,70,10,0.35)"
                strokeWidth={1.5}
              />
            ))}
          </svg>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnStyle} onClick={onRotate}>
            ↻ Rotate
          </button>
          <button style={btnStyle} onClick={onFlip}>
            ⇄ Flip
          </button>
          <button
            style={{ ...btnStyle, color: "#9a4040", borderColor: "rgba(180,60,60,0.3)" }}
            onClick={onCancel}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ── Piece grid ─────────────────────────────────────────────────────────────
  const pieces = PIECES.map((piece) => {
    const isPlaced = placedIds.has(piece.id);
    const isActive = activeId === piece.id;
    const maxR = Math.max(...piece.cells.map((c) => c[0]));
    const maxC = Math.max(...piece.cells.map((c) => c[1]));
    const svgW = (maxC + 1) * TRAY_SZ;
    const svgH = (maxR + 1) * TRAY_SZ;
    const btnW = Math.max(svgW + 20, 60);
    const btnH = Math.max(svgH + 16, 44);

    return (
      <button
        key={piece.id}
        disabled={isPlaced}
        onClick={() => {
          if (isPlaced) return;
          if (isActive) {
            onRotate();
          } else {
            onSelectPiece(piece.id);
          }
        }}
        title={isPlaced ? "Placed" : `Select piece ${piece.id}`}
        style={{
          position: "relative",
          flexShrink: 0,
          width: btnW,
          height: btnH,
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
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{
            position: "absolute",
            left: Math.max((btnW - svgW) / 2, 4),
            top: 8,
          }}
        >
          {piece.cells.map(([r, c], i) => (
            <rect
              key={i}
              x={c * TRAY_SZ + 1}
              y={r * TRAY_SZ + 1}
              width={TRAY_SZ - 2}
              height={TRAY_SZ - 2}
              rx={2}
              fill={isPlaced ? "#ccc" : piece.color}
              stroke={isPlaced ? "#bbb" : "rgba(100,70,10,0.35)"}
              strokeWidth={1}
            />
          ))}
        </svg>
        <span
          style={{
            position: "absolute",
            bottom: 2,
            right: 4,
            fontSize: 9,
            fontWeight: "bold",
            color: isPlaced ? "#aaa" : "#8b6914",
          }}
        >
          {isPlaced ? "✓" : piece.id}
        </span>
      </button>
    );
  });

  return (
    <div className="flex flex-col gap-2 pt-1">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
        Pieces ({placements.length}/10)
      </p>

      {/* Mobile: show active piece panel OR piece grid */}
      {activePiecePanel}

      {/* Wrapper adds a right-side fade on mobile to hint there are more pieces to scroll */}
      <div className="relative md:contents">
        <div
          className={`${activeId ? "hidden md:flex" : "flex"} flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0`}
          style={{ scrollbarWidth: "none" }}
        >
          {pieces}
        </div>
        <div
          className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-10"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(241,235,220,0.92))",
          }}
        />
      </div>

      {/* Reset / Solve — mobile only (desktop has its own row in page.tsx) */}
      <div className={`flex gap-2 mt-1 md:hidden ${activeId ? "hidden" : ""}`}>
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: "6px 0",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            background: "rgba(139,105,20,0.07)",
            border: "1px solid rgba(139,105,20,0.2)",
            color: "#7a5218",
            cursor: "pointer",
          }}
        >
          Reset all
        </button>
        <button
          onClick={onSolve}
          disabled={solving}
          style={{
            flex: 2,
            padding: "8px 0",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            background: solving
              ? "rgba(139,105,20,0.1)"
              : "linear-gradient(135deg, #c8972a 0%, #a07020 100%)",
            border: "none",
            color: solving ? "#a08050" : "#fff",
            cursor: solving ? "default" : "pointer",
            boxShadow: solving ? "none" : "0 2px 8px rgba(139,105,20,0.35)",
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          {solving ? "Solving…" : "✦ Solve"}
        </button>
      </div>
    </div>
  );
}
