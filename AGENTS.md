<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# Project rules and constraints

## Stack

- **Next.js 16 App Router** — all pages are `"use client"` components; no server components needed here
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in `globals.css`; no `tailwind.config.js`; CSS custom properties via `@theme inline`
- **TypeScript strict mode** — no `any`, no ignored type errors
- **No external UI libraries** — styling is done with inline styles + Tailwind utility classes only
- **Node via nvm** — use `source ~/.nvm/nvm.sh && nvm use 22` before running any `npm` / `node` command

---

## Project structure

```
app/
  page.tsx              # Main game orchestrator — all state lives here
  layout.tsx            # Root layout + metadata (OG/Twitter cards)
  globals.css           # Tailwind import + CSS animations (.piece-group, piece-in, piece-out)
components/
  Board.tsx             # Board grid (HTML buttons) + SVG piece overlay
  PieceTray.tsx         # Piece selection tray (horizontal on mobile, vertical on desktop)
  ControlPanel.tsx      # How-to-play instructions + desktop transform controls
  FloatingControls.tsx  # Mobile-only rotate/flip/cancel overlay (md:hidden)
  ConfirmModal.tsx      # Solve confirmation dialog
lib/
  board.ts              # BOARD_ROWS layout, constants, date helpers
  pieces.ts             # Piece definitions, geometry transforms (norm/rot90/flipH/transform)
  solver.ts             # Backtracking constraint solver
tests/
  setup.ts              # @testing-library/jest-dom setup
  unit/                 # Vitest unit tests (board, pieces, solver)
  components/           # Vitest + React Testing Library component tests
  e2e/                  # Playwright e2e tests (desktop + mobile)
```

---

## Layout — mobile vs desktop

- **Single `Board` component** for all viewports — no duplicate rendering
- **CSS Grid** with explicit placement (`md:col-start-X`, `md:row-start-X`, `md:row-span-N`) handles the two-column desktop layout
- **Board scaling**: computed in JS via `boardScale` state — `Math.min(1, (clientWidth - 40) / BOARD_OUTER_WIDTH)` capped also by height; uses `transform: scale()` with `transformOrigin: "top left"` on inner div; outer wrapper clips with `overflow: hidden` at scaled dimensions
- **Mobile breakpoint**: `md` = 768 px (Tailwind default). Below this: single-column stack (board → tray → controls)
- Desktop tray: vertical (`md:flex-col`); mobile tray: horizontal scroll (`flex-row overflow-x-auto`)
- Reset/Solve buttons: inside `PieceTray` on mobile (`.md:hidden`); separate grid row in `page.tsx` on desktop (`.hidden.md:flex`)

---

## SVG piece overlay

- SVG is `position: absolute` over the button grid, `pointerEvents: none`, `zIndex: 1`
- Filter IDs **must** be unique per Board instance — use `useId()` and suffix: `piece-shadow-${uid}`
  - Reason: duplicate DOM IDs cause SVG `filter="url(#...)"` to resolve to the wrong element → pieces invisible
- Piece cells are rendered as `<path>` with `roundedRect()` helpers; adjacent cells share extended rectangles (`ext = GRID_GAP / 2`) for a solid blob look

---

## Animations

- Defined in `globals.css`: `@keyframes piece-in` (scale 0→1) and `@keyframes piece-out` (scale 1→0)
- Applied via `animation` inline style on `.piece-group` SVG `<g>` elements
- `transform-box: fill-box; transform-origin: right center` (desktop) / `center bottom` (mobile) — keeps animation within SVG bounds (translate-based animations are clipped by SVG overflow)
- `removingIds: Set<string>` keeps a piece in the DOM during the 300 ms exit animation before `setPlacements` removes it

---

## Interaction model

### Placing pieces

1. User selects a piece from the tray → `activeId` is set
2. Hovering over the board updates `hover: RC | null` → `preview` cells computed
3. Green preview = `previewValid` (all cells on board, not covered, not date cells)
4. Click → piece placed; `activeId` cleared, `rotation` and `flipped` reset to defaults

### Picking up / removing placed pieces

- **Click** on a covered cell: piece is picked back up (removed from `placements`, set as `activeId` with its original `rot` and `flipped`)
- **Right-click** on a covered cell: piece removed with exit animation (`removeWithAnimation`)
- **Long-press** (mobile, 450 ms): same as right-click — triggers `onLongPress` → `removeWithAnimation`

### Rotation & flip

- Desktop: keyboard `R` / `F`, mouse wheel (active piece only — `passive: false` listener)
- Mobile: tap already-active piece in tray → rotate; FloatingControls overlay for rotate/flip/cancel

### Touch handling (Board.tsx)

- `touchAction: activeId ? "none" : "auto"` — prevents scroll during placement
- `document.elementFromPoint()` + `data-row` / `data-col` attributes used to find cells from touch coordinates
- `e.preventDefault()` in `handleTouchEnd` suppresses the subsequent `click` event when `activeId` is set
- Date-cell taps (no active piece) fall through to `button onClick`

---

## State (app/page.tsx)

| State                 | Type             | Purpose                                 |
| --------------------- | ---------------- | --------------------------------------- |
| `month`, `day`, `dow` | `string`         | Currently selected date                 |
| `activeId`            | `string \| null` | Piece being placed                      |
| `rotation`            | `Rot` (0–3)      | Current rotation of active piece        |
| `flipped`             | `boolean`        | Current flip of active piece            |
| `placements`          | `Placement[]`    | All placed pieces                       |
| `removingIds`         | `Set<string>`    | Pieces mid-exit-animation (kept in DOM) |
| `hover`               | `RC \| null`     | Cell under cursor/finger                |
| `boardScale`          | `number`         | CSS scale factor for mobile fit         |
| `solving`             | `boolean`        | Solver running flag                     |
| `showConfirm`         | `boolean`        | Confirm modal visibility                |

---

## Testing

### Unit tests — `npm test` / `make test`

- **Vitest** with jsdom environment
- Include paths: `tests/unit/**/*.test.ts`, `tests/components/**/*.test.tsx`
- Playwright files must **not** be picked up by Vitest — keep e2e in `tests/e2e/`
- Path alias `@/*` resolves to repo root (mirrors `tsconfig.json`)

### E2e tests — `npm run test:e2e` / `make test-e2e`

- **Playwright** — projects: Desktop Chrome, iPhone 14 (mobile-safari), Pixel 7 (mobile-android)
- `webServer` auto-starts `next dev` when not already running
- Use `test.skip(isMobile, "desktop only")` / `test.skip(!isMobile, "mobile only")` to split desktop/mobile tests
- Board overflow check: `bb.x + bb.width <= viewport.width + 2px`

### What to test when adding features

- Unit-test any new geometry or solver logic in `lib/`
- Component-test any new component prop contracts and user interactions
- E2e-test any new user-visible interaction on both desktop and mobile viewports

---

## Constraints / things NOT to do

- Do not add a second `Board` component or render Board twice — unique filter IDs would need to be re-verified and the whole point was to unify them
- Do not use `window.innerWidth` for board scaling — it includes the scrollbar; use `document.documentElement.clientWidth`
- Do not use CSS `calc()` with a bare number divisor for `scale()` — browser support is unreliable; use JS-based scaling
- Do not use translate-based CSS animations on SVG elements — SVG `overflow: hidden` clips them; use `scale(0)` with directional `transform-origin` instead
- Do not define `<filter id="piece-shadow">` with a hardcoded ID — always suffix with `uid` from `useId()`
- Do not add `passive: true` to the wheel event listener — it must call `e.preventDefault()` to block page scroll
- Do not mock the board or solver in e2e tests — run against the real dev server
