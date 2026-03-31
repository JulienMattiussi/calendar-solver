export type RC = [number, number];
export type Rot = 0 | 1 | 2 | 3;

export interface PieceDef {
  id: string;
  cells: RC[];
  color: string;
}

export const PIECES: PieceDef[] = [
  {
    id: "A",
    color: "#E8B84B",
    cells: [
      [0, 0],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  }, // U-pent  (5) golden
  {
    id: "B",
    color: "#D45C50",
    cells: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 0],
      [3, 1],
    ],
  }, // J-pent  (5) coral red
  {
    id: "C",
    color: "#52A86B",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [2, 0],
    ],
  }, // big-L   (5) forest green
  {
    id: "D",
    color: "#5080C8",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
  }, // Z-pent  (5) steel blue
  {
    id: "E",
    color: "#9858C8",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
      [2, 1],
    ],
  }, // T-pent  (5) purple
  {
    id: "F",
    color: "#E07838",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
    ],
  }, // P-pent  (5) burnt orange
  {
    id: "G",
    color: "#38A8B0",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
      [3, 0],
    ],
  }, // N-pent  (5) teal
  {
    id: "H",
    color: "#C87050",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
  }, // L-tet   (4) terracotta
  {
    id: "I",
    color: "#70B040",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  }, // S-tet   (4) lime green
  {
    id: "J",
    color: "#B84880",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
  }, // bar     (4) rose
];

export const TRAY_SZ = 16;

export function norm(cells: RC[]): RC[] {
  const minR = Math.min(...cells.map((c) => c[0]));
  const minC = Math.min(...cells.map((c) => c[1]));
  return cells.map(([r, c]) => [r - minR, c - minC]);
}

export function rot90(cells: RC[]): RC[] {
  return norm(cells.map(([r, c]) => [c, -r]));
}

export function flipH(cells: RC[]): RC[] {
  return norm(cells.map(([r, c]) => [r, -c]));
}

export function transform(cells: RC[], rotation: Rot, flipped: boolean): RC[] {
  let res = flipped ? flipH(cells) : [...cells];
  for (let i = 0; i < rotation; i++) res = rot90(res);
  return res;
}

export function absoluteCells(
  cells: RC[],
  rotation: Rot,
  flipped: boolean,
  anchorRow: number,
  anchorCol: number,
): RC[] {
  return transform(cells, rotation, flipped).map(([dr, dc]) => [
    anchorRow + dr,
    anchorCol + dc,
  ]);
}

// Build SVG path for a rectangle with per-corner radii
export function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number,
): string {
  const p: string[] = [];
  p.push(`M ${x + tl} ${y}`);
  p.push(`L ${x + w - tr} ${y}`);
  if (tr) p.push(`Q ${x + w} ${y} ${x + w} ${y + tr}`);
  p.push(`L ${x + w} ${y + h - br}`);
  if (br) p.push(`Q ${x + w} ${y + h} ${x + w - br} ${y + h}`);
  p.push(`L ${x + bl} ${y + h}`);
  if (bl) p.push(`Q ${x} ${y + h} ${x} ${y + h - bl}`);
  p.push(`L ${x} ${y + tl}`);
  if (tl) p.push(`Q ${x} ${y} ${x + tl} ${y}`);
  p.push("Z");
  return p.join(" ");
}

export interface Orientation {
  cells: RC[];
  rot: Rot;
  flipped: boolean;
}

export function getOrientations(cells: RC[]): Orientation[] {
  const seen = new Set<string>();
  const result: Orientation[] = [];
  for (let f = 0; f < 2; f++) {
    for (let r = 0; r < 4; r++) {
      const c = transform(cells, r as Rot, f === 1);
      const key = JSON.stringify(
        [...c].sort((a, b) => a[0] - b[0] || a[1] - b[1]),
      );
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ cells: c, rot: r as Rot, flipped: f === 1 });
      }
    }
  }
  return result;
}

export const PIECE_ORIENTATIONS = PIECES.map((p) => ({
  id: p.id,
  orientations: getOrientations(p.cells),
}));
