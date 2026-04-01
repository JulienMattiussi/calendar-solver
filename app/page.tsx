"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

import Board from "@/components/Board";
import PieceTray from "@/components/PieceTray";
import ControlPanel from "@/components/ControlPanel";
import ConfirmModal from "@/components/ConfirmModal";

import {
  BOARD_ROWS,
  MONTHS,
  DAYS_DOW,
  TOTAL_BOARD_CELLS,
  getDefaultDate,
  BOARD_OUTER_WIDTH,
  BOARD_OUTER_HEIGHT,
} from "@/lib/board";
import { PIECES, absoluteCells, type RC, type Rot } from "@/lib/pieces";
import { solvePuzzle, type Placement } from "@/lib/solver";
import { useHistory } from "@/lib/useHistory";

export default function CalendarPuzzle() {
  const def = getDefaultDate();
  const [month, setMonth] = useState(def.month);
  const [day, setDay] = useState(def.day);
  const [dow, setDow] = useState(def.dow);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [rotation, setRotation] = useState<Rot>(0);
  const [flipped, setFlipped] = useState(false);
  const {
    placements,
    commit,
    undo,
    redo,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<RC | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [solving, setSolving] = useState(false);

  const [boardScale, setBoardScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const vw = document.documentElement.clientWidth;
      const scaleW = (vw - 40) / BOARD_OUTER_WIDTH;
      if (scaleW >= 1) {
        setBoardScale(1);
        return;
      } // desktop: width fits, no scaling
      // Mobile: also cap by height — ~220px reserved for header, tray, panel, gaps, padding
      const scaleH = (window.innerHeight - 220) / BOARD_OUTER_HEIGHT;
      setBoardScale(Math.min(scaleW, scaleH));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // "r,c" -> pieceId for placed pieces
  const coverage = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of placements) {
      const piece = PIECES.find((x) => x.id === p.pieceId)!;
      for (const [r, c] of absoluteCells(
        piece.cells,
        p.rot,
        p.flipped,
        p.row,
        p.col,
      ))
        map.set(`${r},${c}`, p.pieceId);
    }
    return map;
  }, [placements]);

  const activePiece = PIECES.find((p) => p.id === activeId) ?? null;

  const preview = useMemo<RC[]>(() => {
    if (!activePiece || !hover) return [];
    return absoluteCells(
      activePiece.cells,
      rotation,
      flipped,
      hover[0],
      hover[1],
    );
  }, [activePiece, hover, rotation, flipped]);

  const previewValid = useMemo(() => {
    if (!preview.length) return false;
    return preview.every(([r, c]) => {
      const label = BOARD_ROWS[r]?.[c];
      if (!label) return false;
      if (coverage.has(`${r},${c}`)) return false;
      return label !== month && label !== day && label !== dow;
    });
  }, [preview, coverage, month, day, dow]);

  const solved = coverage.size === TOTAL_BOARD_CELLS - 3;

  const handleSolve = useCallback(() => {
    setShowConfirm(false);
    setSolving(true);
    setTimeout(() => {
      const solution = solvePuzzle(month, day, dow);
      setSolving(false);
      if (solution) {
        resetHistory();
        setRemovingIds(new Set());
        solution.forEach((placement, i) => {
          setTimeout(() => commit((prev) => [...prev, placement]), i * 80);
        });
      } else {
        alert("No solution found for this date with the current pieces.");
      }
    }, 50);
  }, [month, day, dow]);

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z") { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { e.preventDefault(); redo(); return; }
      if (!activeId) return;
      if (e.key === "r" || e.key === "R") setRotation((r) => ((r + 1) % 4) as Rot);
      if (e.key === "f" || e.key === "F") setFlipped((f) => !f);
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [activeId, undo, redo]);

  // Mouse-wheel rotation when a piece is active
  useEffect(() => {
    const fn = (e: WheelEvent) => {
      if (!activeId) return;
      e.preventDefault();
      setRotation((r) => ((r + (e.deltaY > 0 ? 1 : 3)) % 4) as Rot);
    };
    window.addEventListener("wheel", fn, { passive: false });
    return () => window.removeEventListener("wheel", fn);
  }, [activeId]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const label = BOARD_ROWS[row]?.[col];
      if (!label) return;
      if (activeId && activePiece) {
        if (!previewValid) return;
        commit((prev) => [
          ...prev,
          { pieceId: activeId, row, col, rot: rotation, flipped },
        ]);
        setActiveId(null);
        setRotation(0);
        setFlipped(false);
      } else {
        // Click on a placed piece → pick it up to reposition
        const pieceId = coverage.get(`${row},${col}`);
        if (pieceId && !removingIds.has(pieceId)) {
          const pl = placements.find((p) => p.pieceId === pieceId)!;
          commit((prev) => prev.filter((p) => p.pieceId !== pieceId));
          setActiveId(pieceId);
          setRotation(pl.rot);
          setFlipped(pl.flipped);
          return;
        }
        if (MONTHS.includes(label)) setMonth(label);
        else if (DAYS_DOW.includes(label)) setDow(label);
        else setDay(label);
      }
    },
    [
      activeId,
      activePiece,
      previewValid,
      rotation,
      flipped,
      coverage,
      removingIds,
      placements,
    ],
  );

  const ANIM_MS = 300;

  const removeWithAnimation = useCallback((ids: string[]) => {
    setRemovingIds((prev) => new Set([...prev, ...ids]));
    setTimeout(() => {
      commit((prev) => prev.filter((p) => !ids.includes(p.pieceId)));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, ANIM_MS);
  }, [commit]);

  const handleRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      const pieceId = coverage.get(`${row},${col}`);
      if (pieceId && !removingIds.has(pieceId)) removeWithAnimation([pieceId]);
    },
    [coverage, removingIds, removeWithAnimation],
  );

  const handleSelectPiece = useCallback((id: string | null) => {
    setActiveId(id);
    setRotation(0);
    setFlipped(false);
  }, []);

  const handleReset = useCallback(() => {
    setActiveId(null);
    if (placements.length === 0) return;
    resetHistory();
    setRemovingIds(new Set());
  }, [placements, resetHistory]);

  const trayProps = {
    placements,
    activeId,
    solving,
    rotation,
    flipped,
    canUndo,
    canRedo,
    onSelectPiece: handleSelectPiece,
    onRotate: () => setRotation((r) => ((r + 1) % 4) as Rot),
    onFlip: () => setFlipped((f) => !f),
    onCancel: () => setActiveId(null),
    onUndo: undo,
    onRedo: redo,
    onReset: handleReset,
    onSolve: () => {
      setActiveId(null);
      setShowConfirm(true);
    },
  };

  const boardProps = {
    placements,
    removingIds,
    coverage,
    preview,
    previewValid,
    month,
    day,
    dow,
    activeId,
    onCellClick: handleCellClick,
    onRightClick: handleRightClick,
    onHover: setHover,
    onLongPress: (row: number, col: number) => {
      const pieceId = coverage.get(`${row},${col}`);
      if (pieceId && !removingIds.has(pieceId)) removeWithAnimation([pieceId]);
    },
  };

  const panelProps = {
    activeId,
    onRotate: () => setRotation((r) => ((r + 1) % 4) as Rot),
    onFlip: () => setFlipped((f) => !f),
    onCancel: () => setActiveId(null),
  };

  const scaledW = Math.round(BOARD_OUTER_WIDTH * boardScale);
  const scaledH = Math.round(BOARD_OUTER_HEIGHT * boardScale);

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-2 md:p-4 gap-2 md:gap-5">
      <h1 className="text-lg md:text-2xl font-bold text-stone-700 tracking-wide uppercase">
        A-Puzzle-A-Day
      </h1>

      {solved && (
        <div className="px-6 py-2 rounded-full bg-amber-100 border border-amber-400 text-amber-800 font-semibold text-sm">
          🎉 Solved! {month} {day} {dow}
        </div>
      )}

      {/* ── Unified layout — CSS Grid handles both mobile and desktop ── */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-[auto_auto] items-start">
        {/* Board — col 1 row 1, scaled to fit viewport on mobile */}
        <div
          className="md:col-start-1 md:row-start-1 relative"
          style={{ width: scaledW, height: scaledH, overflow: "hidden" }}
        >
          <div
            style={{
              width: BOARD_OUTER_WIDTH,
              transformOrigin: "top left",
              transform: `scale(${boardScale})`,
            }}
          >
            <Board {...boardProps} />
          </div>
        </div>

        {/* Piece tray — col 2 rows 1-3 on desktop, row 2 on mobile */}
        <div className="md:col-start-2 md:row-start-1 md:row-span-3 min-w-0">
          <PieceTray {...trayProps} />
        </div>

        {/* Reset / Undo / Redo / Solve — desktop only, col 1 row 2 (above instructions) */}
        <div
          className="hidden md:flex gap-2 md:col-start-1 md:row-start-2"
          style={{ width: scaledW }}
        >
          <button
            onClick={trayProps.onReset}
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
            Reset
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{
              flex: 1,
              padding: "6px 0",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              background: "rgba(139,105,20,0.07)",
              border: "1px solid rgba(139,105,20,0.2)",
              color: canUndo ? "#7a5218" : "#c0aa80",
              cursor: canUndo ? "pointer" : "default",
            }}
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            style={{
              flex: 1,
              padding: "6px 0",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              background: "rgba(139,105,20,0.07)",
              border: "1px solid rgba(139,105,20,0.2)",
              color: canRedo ? "#7a5218" : "#c0aa80",
              cursor: canRedo ? "pointer" : "default",
            }}
          >
            ↪
          </button>
          <button
            onClick={trayProps.onSolve}
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

        {/* Control panel — col 1 row 3 on desktop, row 3 on mobile */}
        <div className="md:col-start-1 md:row-start-3">
          <ControlPanel {...panelProps} style={{ width: scaledW }} />
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          month={month}
          day={day}
          dow={dow}
          onConfirm={handleSolve}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </main>
  );
}
