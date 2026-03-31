export const BOARD_ROWS: (string | null)[][] = [
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", null],
  ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", null],
  ["1",   "2",   "3",   "4",   "5",   "6",   "7"],
  ["8",   "9",   "10",  "11",  "12",  "13",  "14"],
  ["15",  "16",  "17",  "18",  "19",  "20",  "21"],
  ["22",  "23",  "24",  "25",  "26",  "27",  "28"],
  ["29",  "30",  "31",  "Sun", "Mon", "Tue", "Wed"],
  [null,  null,  null,  null,  "Thu", "Fri", "Sat"],
];

export const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const DAYS_DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const TOTAL_BOARD_CELLS = BOARD_ROWS.flat().filter(Boolean).length; // 50

export const CELL_PX      = 56;
export const BOARD_PAD    = 16; // p-4
export const GRID_GAP     = 4;  // gap-1
export const BOARD_BORDER = 6;
export const BOARD_OUTER_WIDTH = 7 * CELL_PX + 6 * GRID_GAP + 2 * BOARD_PAD + 2 * BOARD_BORDER; // 460

export function isValidCell(row: number, col: number): boolean {
  if (row < 0 || row >= BOARD_ROWS.length || col < 0 || col >= 7) return false;
  return BOARD_ROWS[row][col] !== null;
}

export function getDefaultDate() {
  const t = new Date();
  return {
    month: MONTHS[t.getMonth()],
    day:   String(t.getDate()),
    dow:   DAYS_DOW[t.getDay()],
  };
}
