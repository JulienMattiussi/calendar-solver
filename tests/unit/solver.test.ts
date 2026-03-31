import { describe, it, expect } from "vitest";
import { solvePuzzle } from "@/lib/solver";
import { PIECES, absoluteCells } from "@/lib/pieces";
import { BOARD_ROWS } from "@/lib/board";

function validateSolution(
  placements: ReturnType<typeof solvePuzzle>,
  month: string,
  day: string,
  dow: string,
) {
  expect(placements).not.toBeNull();
  const solution = placements!;

  // Each piece used exactly once
  const usedIds = solution.map((p) => p.pieceId);
  expect(new Set(usedIds).size).toBe(usedIds.length);
  expect(usedIds.length).toBe(PIECES.length);

  // Build covered set
  const covered = new Set<string>();
  for (const pl of solution) {
    const piece = PIECES.find((p) => p.id === pl.pieceId)!;
    for (const [r, c] of absoluteCells(
      piece.cells,
      pl.rot,
      pl.flipped,
      pl.row,
      pl.col,
    )) {
      const key = `${r},${c}`;
      // No overlaps
      expect(covered.has(key)).toBe(false);
      covered.add(key);
    }
  }

  // Covered cells are valid board cells (not null, not date cells)
  for (const key of covered) {
    const [r, c] = key.split(",").map(Number);
    const label = BOARD_ROWS[r]?.[c];
    expect(label).not.toBeNull();
    expect(label).not.toBe(month);
    expect(label).not.toBe(day);
    expect(label).not.toBe(dow);
  }

  // The 3 date cells are uncovered
  const dateLabels = [month, day, dow];
  for (const [ri, row] of BOARD_ROWS.entries()) {
    for (const [ci, label] of row.entries()) {
      if (label && dateLabels.includes(label)) {
        expect(covered.has(`${ri},${ci}`)).toBe(false);
      }
    }
  }
}

describe("solvePuzzle", () => {
  it("solves Jan 1 Sun", () => {
    validateSolution(solvePuzzle("Jan", "1", "Sun"), "Jan", "1", "Sun");
  });

  it("solves Mar 31 Tue", () => {
    validateSolution(solvePuzzle("Mar", "31", "Tue"), "Mar", "31", "Tue");
  });

  it("solves Dec 25 Thu", () => {
    validateSolution(solvePuzzle("Dec", "25", "Thu"), "Dec", "25", "Thu");
  });

  it("solves Jun 15 Wed", () => {
    validateSolution(solvePuzzle("Jun", "15", "Wed"), "Jun", "15", "Wed");
  });

  it("solves Aug 7 Sat", () => {
    validateSolution(solvePuzzle("Aug", "7", "Sat"), "Aug", "7", "Sat");
  });

  it("covers exactly 47 cells (50 board cells minus 3 date cells)", () => {
    const solution = solvePuzzle("Feb", "14", "Mon")!;
    const covered = new Set<string>();
    for (const pl of solution) {
      const piece = PIECES.find((p) => p.id === pl.pieceId)!;
      for (const [r, c] of absoluteCells(
        piece.cells,
        pl.rot,
        pl.flipped,
        pl.row,
        pl.col,
      )) {
        covered.add(`${r},${c}`);
      }
    }
    // 10 pieces: 6×5-cell + 4×4-cell = 30+16 = 46... but 2 are 4-cell pieces (H,I,J)
    // H=4, I=4, J=4, rest=5 → 7×5 + 3×4 = 35+12 = 47
    expect(covered.size).toBe(47);
  });

  it("returns the same number of pieces as PIECES array", () => {
    const solution = solvePuzzle("Sep", "3", "Fri")!;
    expect(solution.length).toBe(PIECES.length);
  });
});
