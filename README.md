# A-Puzzle-A-Day

> A daily calendar puzzle — fit all 10 pieces on the board to reveal today's month, day, and weekday.

![Preview](https://calendar-solver.vercel.app/preview.png)

---

## How to play

1. **Select a piece** from the tray on the right (or below on mobile)
2. **Hover** over the board — green cells show a valid placement
3. **Click** to place the piece
4. Press **R** to rotate, **F** to flip, **Esc** to cancel selection
5. **Right-click** (or long-press on mobile) a placed piece to remove it
6. Hit **✦ Solve** to let the solver find a solution automatically

The three cells left uncovered at the end should spell out the current date.

---

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- Backtracking constraint solver (pure TypeScript, runs in ~50 ms)

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  page.tsx              # Main game orchestrator
  layout.tsx            # Root layout + metadata
  icon.tsx              # Favicon (generated PNG via next/og)
  opengraph-image.tsx   # OG / social-preview image (1200×630)
components/
  Board.tsx             # Board grid + SVG piece overlay
  PieceTray.tsx         # Piece selection tray (vertical / horizontal)
  ControlPanel.tsx      # How-to-play + transform controls
  ConfirmModal.tsx      # Solve confirmation dialog
lib/
  board.ts              # Board layout, constants, date helpers
  pieces.ts             # Piece definitions, geometry transforms
  solver.ts             # Backtracking solver
```
