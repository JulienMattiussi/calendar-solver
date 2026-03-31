"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

import Board        from "@/components/Board";
import PieceTray    from "@/components/PieceTray";
import ControlPanel from "@/components/ControlPanel";
import ConfirmModal from "@/components/ConfirmModal";

import { BOARD_ROWS, MONTHS, DAYS_DOW, TOTAL_BOARD_CELLS, getDefaultDate } from "@/lib/board";
import { PIECES, absoluteCells, type RC, type Rot } from "@/lib/pieces";
import { solvePuzzle, type Placement } from "@/lib/solver";

export default function CalendarPuzzle() {
  const def = getDefaultDate();
  const [month, setMonth] = useState(def.month);
  const [day,   setDay]   = useState(def.day);
  const [dow,   setDow]   = useState(def.dow);

  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [rotation,    setRotation]    = useState<Rot>(0);
  const [flipped,     setFlipped]     = useState(false);
  const [placements,  setPlacements]  = useState<Placement[]>([]);
  const [hover,       setHover]       = useState<RC | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [solving,     setSolving]     = useState(false);

  // "r,c" -> pieceId for placed pieces
  const coverage = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of placements) {
      const piece = PIECES.find(x => x.id === p.pieceId)!;
      for (const [r, c] of absoluteCells(piece.cells, p.rot, p.flipped, p.row, p.col))
        map.set(`${r},${c}`, p.pieceId);
    }
    return map;
  }, [placements]);

  const activePiece = PIECES.find(p => p.id === activeId) ?? null;

  const preview = useMemo<RC[]>(() => {
    if (!activePiece || !hover) return [];
    return absoluteCells(activePiece.cells, rotation, flipped, hover[0], hover[1]);
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
        setPlacements([]);
        solution.forEach((placement, i) => {
          setTimeout(() => setPlacements(prev => [...prev, placement]), i * 80);
        });
      } else {
        alert("No solution found for this date with the current pieces.");
      }
    }, 50);
  }, [month, day, dow]);

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!activeId) return;
      if (e.key === "r" || e.key === "R") setRotation(r => ((r + 1) % 4) as Rot);
      if (e.key === "f" || e.key === "F") setFlipped(f => !f);
      if (e.key === "Escape")             setActiveId(null);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [activeId]);

  const handleCellClick = useCallback((row: number, col: number) => {
    const label = BOARD_ROWS[row]?.[col];
    if (!label) return;
    if (activeId && activePiece) {
      if (!previewValid) return;
      setPlacements(prev => [...prev, { pieceId: activeId, row, col, rot: rotation, flipped }]);
      setActiveId(null); setRotation(0); setFlipped(false);
    } else {
      if (MONTHS.includes(label))        setMonth(label);
      else if (DAYS_DOW.includes(label)) setDow(label);
      else                               setDay(label);
    }
  }, [activeId, activePiece, previewValid, rotation, flipped]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    const pieceId = coverage.get(`${row},${col}`);
    if (pieceId) setPlacements(prev => prev.filter(p => p.pieceId !== pieceId));
  }, [coverage]);

  const handleSelectPiece = useCallback((id: string | null) => {
    setActiveId(id);
    setRotation(0);
    setFlipped(false);
  }, []);

  const handleReset = useCallback(() => {
    setPlacements([]);
    setActiveId(null);
  }, []);

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 gap-5">
      <h1 className="text-2xl font-bold text-stone-700 tracking-wide uppercase">
        A-Puzzle-A-Day
      </h1>

      {solved && (
        <div className="px-6 py-2 rounded-full bg-amber-100 border border-amber-400 text-amber-800 font-semibold text-sm">
          🎉 Solved! {month} {day} {dow}
        </div>
      )}

      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-4 items-start">
          <Board
            placements={placements}
            coverage={coverage}
            preview={preview}
            previewValid={previewValid}
            month={month}
            day={day}
            dow={dow}
            activeId={activeId}
            onCellClick={handleCellClick}
            onRightClick={handleRightClick}
            onHover={setHover}
          />
          <ControlPanel
            activeId={activeId}
            onRotate={() => setRotation(r => ((r + 1) % 4) as Rot)}
            onFlip={() => setFlipped(f => !f)}
            onCancel={() => setActiveId(null)}
          />
        </div>

        <PieceTray
          placements={placements}
          activeId={activeId}
          solving={solving}
          onSelectPiece={handleSelectPiece}
          onReset={handleReset}
          onSolve={() => { setActiveId(null); setShowConfirm(true); }}
        />
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
