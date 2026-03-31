import { describe, it, expect } from "vitest";
import {
  BOARD_ROWS,
  MONTHS,
  DAYS_DOW,
  TOTAL_BOARD_CELLS,
  BOARD_OUTER_WIDTH,
  BOARD_OUTER_HEIGHT,
  CELL_PX,
  BOARD_PAD,
  GRID_GAP,
  BOARD_BORDER,
  isValidCell,
  getDefaultDate,
} from "@/lib/board";

describe("BOARD_ROWS", () => {
  it("has 8 rows and 7 columns", () => {
    expect(BOARD_ROWS.length).toBe(8);
    expect(BOARD_ROWS.every((r) => r.length === 7)).toBe(true);
  });

  it("contains all 12 months", () => {
    const labels = BOARD_ROWS.flat().filter(Boolean) as string[];
    for (const m of MONTHS) expect(labels).toContain(m);
  });

  it("contains all 7 days of week", () => {
    const labels = BOARD_ROWS.flat().filter(Boolean) as string[];
    for (const d of DAYS_DOW) expect(labels).toContain(d);
  });

  it("contains day numbers 1–31", () => {
    const labels = BOARD_ROWS.flat().filter(Boolean) as string[];
    for (let i = 1; i <= 31; i++) expect(labels).toContain(String(i));
  });
});

describe("TOTAL_BOARD_CELLS", () => {
  it("equals 50", () => {
    expect(TOTAL_BOARD_CELLS).toBe(50);
  });
});

describe("board dimensions", () => {
  it("BOARD_OUTER_WIDTH matches formula", () => {
    expect(BOARD_OUTER_WIDTH).toBe(
      7 * CELL_PX + 6 * GRID_GAP + 2 * BOARD_PAD + 2 * BOARD_BORDER,
    );
  });
  it("BOARD_OUTER_HEIGHT matches formula", () => {
    expect(BOARD_OUTER_HEIGHT).toBe(
      8 * CELL_PX + 7 * GRID_GAP + 2 * BOARD_PAD + 2 * BOARD_BORDER,
    );
  });
});

describe("isValidCell", () => {
  it("returns true for known valid cell", () => {
    expect(isValidCell(0, 0)).toBe(true); // Jan
  });
  it("returns false for null slot (row 0, col 6 is the hole)", () => {
    expect(isValidCell(0, 6)).toBe(false);
  });
  it("returns false for out-of-bounds row", () => {
    expect(isValidCell(-1, 0)).toBe(false);
    expect(isValidCell(8, 0)).toBe(false);
  });
  it("returns false for out-of-bounds col", () => {
    expect(isValidCell(0, 7)).toBe(false);
  });
  it("returns false for bottom-left null cells", () => {
    // Row 7, cols 0–3 are null
    expect(isValidCell(7, 0)).toBe(false);
    expect(isValidCell(7, 3)).toBe(false);
  });
});

describe("getDefaultDate", () => {
  it("returns valid month, day, dow strings", () => {
    const { month, day, dow } = getDefaultDate();
    expect(MONTHS).toContain(month);
    expect(DAYS_DOW).toContain(dow);
    expect(Number(day)).toBeGreaterThanOrEqual(1);
    expect(Number(day)).toBeLessThanOrEqual(31);
  });
});
