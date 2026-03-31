import { BOARD_ROWS } from "./board";
import {
  PIECES,
  PIECE_ORIENTATIONS,
  absoluteCells,
  type RC,
  type Rot,
} from "./pieces";

export interface Placement {
  pieceId: string;
  row: number;
  col: number;
  rot: Rot;
  flipped: boolean;
}

export function solvePuzzle(
  month: string,
  day: string,
  dow: string,
): Placement[] | null {
  const orderedTargets: RC[] = [];
  BOARD_ROWS.forEach((row, r) =>
    row.forEach((label, c) => {
      if (label && label !== month && label !== day && label !== dow)
        orderedTargets.push([r, c]);
    }),
  );
  const targetSet = new Set(orderedTargets.map(([r, c]) => `${r},${c}`));
  const covered = new Set<string>();
  const result: Placement[] = [];

  function bt(remaining: number[]): boolean {
    let first: RC | null = null;
    for (const cell of orderedTargets) {
      if (!covered.has(`${cell[0]},${cell[1]}`)) {
        first = cell;
        break;
      }
    }
    if (!first) return remaining.length === 0;
    if (!remaining.length) return false;

    const [tr, tc] = first;
    for (let pi = 0; pi < remaining.length; pi++) {
      const { id, orientations } = PIECE_ORIENTATIONS[remaining[pi]];
      for (const { cells: oc, rot, flipped } of orientations) {
        for (const [dr, dc] of oc) {
          const ar = tr - dr,
            ac = tc - dc;
          const abs = oc.map(([r, c]) => [ar + r, ac + c] as RC);
          if (
            abs.every(
              ([r, c]) =>
                targetSet.has(`${r},${c}`) && !covered.has(`${r},${c}`),
            )
          ) {
            for (const [r, c] of abs) covered.add(`${r},${c}`);
            result.push({ pieceId: id, row: ar, col: ac, rot, flipped });
            if (bt(remaining.filter((_, i) => i !== pi))) return true;
            result.pop();
            for (const [r, c] of abs) covered.delete(`${r},${c}`);
          }
        }
      }
    }
    return false;
  }

  return bt(PIECES.map((_, i) => i)) ? [...result] : null;
}
