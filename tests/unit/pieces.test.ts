import { describe, it, expect } from "vitest";
import {
  norm,
  rot90,
  flipH,
  transform,
  absoluteCells,
  getOrientations,
  PIECES,
  PIECE_ORIENTATIONS,
  type RC,
  type Rot,
} from "@/lib/pieces";

describe("norm", () => {
  it("shifts cells so min row and col are 0", () => {
    expect(
      norm([
        [2, 3],
        [3, 4],
      ]),
    ).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });
  it("is identity for already-normalised cells", () => {
    expect(
      norm([
        [0, 0],
        [0, 1],
        [1, 0],
      ]),
    ).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
    ]);
  });
});

describe("rot90", () => {
  it("rotates a single cell to origin", () => {
    expect(rot90([[0, 0]])).toEqual([[0, 0]]);
  });
  it("4 rotations returns original shape", () => {
    const cells: RC[] = [
      [0, 0],
      [0, 1],
      [1, 0],
    ];
    let r = cells;
    for (let i = 0; i < 4; i++) r = rot90(r);
    expect(r).toEqual(norm(cells));
  });
  it("rotates an L shape correctly", () => {
    // [[0,0],[1,0],[2,0]] → horizontal bar after one 90° rotation
    const result = rot90([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
    const sorted = [...result].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    expect(sorted).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
  });
});

describe("flipH", () => {
  it("mirrors horizontally", () => {
    const cells: RC[] = [
      [0, 0],
      [0, 1],
      [1, 0],
    ];
    const flipped = flipH(cells);
    // col 0 → col 1, col 1 → col 0
    expect(flipped).toContainEqual([0, 0]);
    expect(flipped).toContainEqual([0, 1]);
    expect(flipped).toContainEqual([1, 1]);
  });
  it("double flip returns original", () => {
    const cells: RC[] = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    expect(flipH(flipH(cells))).toEqual(norm(cells));
  });
});

describe("transform", () => {
  it("rot=0, flipped=false is identity (normalised)", () => {
    const cells: RC[] = [
      [0, 0],
      [0, 1],
      [1, 1],
    ];
    expect(transform(cells, 0, false)).toEqual(cells);
  });
  it("flipped=true then rot applies to flipped shape", () => {
    const cells: RC[] = [
      [0, 0],
      [0, 1],
      [1, 0],
    ];
    const a = transform(cells, 1, true);
    const b = rot90(flipH(cells));
    expect(a).toEqual(b);
  });
});

describe("absoluteCells", () => {
  it("offsets by anchor", () => {
    const cells: RC[] = [
      [0, 0],
      [0, 1],
    ];
    expect(absoluteCells(cells, 0, false, 3, 2)).toEqual([
      [3, 2],
      [3, 3],
    ]);
  });
  it("applies rotation before offsetting", () => {
    // vertical bar [[0,0],[1,0],[2,0]] rotated 90° → horizontal bar
    // anchored at (2,1) → cells all in row 2, cols 1,2,3
    const cells: RC[] = [
      [0, 0],
      [1, 0],
      [2, 0],
    ];
    const result = absoluteCells(cells, 1, false, 2, 1);
    const sorted = [...result].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    expect(sorted).toEqual([
      [2, 1],
      [2, 2],
      [2, 3],
    ]);
  });
});

describe("getOrientations", () => {
  it("returns only unique orientations", () => {
    for (const piece of PIECES) {
      const orients = getOrientations(piece.cells);
      const keys = orients.map((o) =>
        JSON.stringify([...o.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1])),
      );
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("bar piece (J) has 2 orientations", () => {
    const J = PIECES.find((p) => p.id === "J")!;
    expect(getOrientations(J.cells).length).toBe(2);
  });

  it("asymmetric piece (B) has 8 orientations (4 rot × 2 flip)", () => {
    const B = PIECES.find((p) => p.id === "B")!;
    // J-shaped pentomino — fully asymmetric
    expect(getOrientations(B.cells).length).toBe(8);
  });
});

describe("PIECE_ORIENTATIONS", () => {
  it("has an entry for every piece", () => {
    expect(PIECE_ORIENTATIONS.length).toBe(PIECES.length);
  });
  it("each orientation cell count equals the piece cell count", () => {
    for (const { id, orientations } of PIECE_ORIENTATIONS) {
      const piece = PIECES.find((p) => p.id === id)!;
      for (const o of orientations) {
        expect(o.cells.length).toBe(piece.cells.length);
      }
    }
  });
});
