import { test, expect, type Page } from "@playwright/test";

// ─── Setup ────────────────────────────────────────────────────────────────────

// Wait for React hydration to complete before each test.
// Without this, clicks can land before event handlers are attached.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Click the cell that displays the given label on the board. */
async function clickCell(page: Page, label: string) {
  await page
    .locator(`button[data-row]`)
    .filter({ hasText: label })
    .first()
    .click();
}

/** Click a piece button in the tray by its id. */
async function selectPiece(page: Page, id: string) {
  await page.locator(`button[title="Select piece ${id}"]`).click();
}

/**
 * Both mobile tray and desktop row have a Solve button in the DOM.
 * Use .last() — the desktop button is rendered after the tray in DOM order.
 * On mobile tests, the tray button is first and the desktop one is hidden,
 * but .last() is still the safer call since only one is visible at a time.
 */
async function clickSolve(page: Page) {
  await page
    .locator("button")
    .filter({ hasText: /✦ Solve|Solving/, visible: true })
    .click();
}

async function clickReset(page: Page) {
  await page
    .locator("button")
    .filter({ hasText: "Reset all", visible: true })
    .click();
}

/**
 * Dismiss the confirm modal by clicking Cancel.
 * The ControlPanel also has a "Cancel" button — filter to the visible one.
 * The modal's Cancel is always visible when the modal is open.
 */
async function dismissModal(page: Page) {
  // "Solve it" only exists in the modal — use it to scope the Cancel button
  await page
    .locator("button")
    .filter({ hasText: /^Cancel$/, visible: true })
    .last()
    .click();
}

// ─── Layout & render ──────────────────────────────────────────────────────────

test("page title is visible", async ({ page }) => {
  // DOM text is "A-Puzzle-A-Day"; CSS `text-transform: uppercase` is visual only.
  await expect(page.locator("h1")).toContainText("A-Puzzle-A-Day");
});

test("board renders 50 cells (buttons with data-row)", async ({ page }) => {
  await expect(page.locator("button[data-row]")).toHaveCount(50);
});

test("piece tray shows 0/10 initially", async ({ page }) => {
  await expect(page.locator("text=/0\\/10/")).toBeVisible();
});

test("all 10 piece buttons are visible in tray", async ({ page }) => {
  for (const id of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]) {
    await expect(
      page.locator(`button[title="Select piece ${id}"]`),
    ).toBeVisible();
  }
});

// ─── Date selection ───────────────────────────────────────────────────────────

test("clicking a month cell selects it", async ({ page }) => {
  await clickCell(page, "Feb");
  await clickSolve(page);
  // Modal shows the date as "Feb · <day> · <dow>" — pattern unique to the modal
  await expect(page.locator("text=/Feb ·/")).toBeVisible();
  await dismissModal(page);
});

test("clicking a day-of-week cell selects it", async ({ page }) => {
  await clickCell(page, "Mon");
  await clickSolve(page);
  await expect(page.locator("text=/· Mon/")).toBeVisible();
  await dismissModal(page);
});

// ─── Piece placement (desktop) ────────────────────────────────────────────────

test("selecting a piece puts board in crosshair mode", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "A");
  // Board cells get cursor: crosshair when a piece is active
  await expect(page.locator("button[data-row]").first()).toHaveCSS(
    "cursor",
    "crosshair",
  );
});

test("placing a piece updates the count", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "C"); // big-L 5-cell piece — anchors cleanly at [2,0]

  const cell = page.locator(`button[data-row="2"][data-col="0"]`);
  await cell.hover();
  // Wait for green preview before clicking (confirms previewValid=true)
  await expect(cell).toHaveCSS("background", /rgba\(110,\s*185,\s*110/);
  await cell.click();

  await expect(page.locator("text=/1\\/10/")).toBeVisible();
});

test("placed piece disables its tray button", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "C");
  const cell = page.locator(`button[data-row="2"][data-col="0"]`);
  await cell.hover();
  await expect(cell).toHaveCSS("background", /rgba\(110,\s*185,\s*110/);
  await cell.click();
  await expect(page.locator("button[title='Placed']").first()).toBeDisabled();
});

test("clicking a placed piece picks it back up", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "C");
  const cell = page.locator(`button[data-row="2"][data-col="0"]`);
  await cell.hover();
  await expect(cell).toHaveCSS("background", /rgba\(110,\s*185,\s*110/);
  await cell.click();
  await expect(page.locator("text=/1\\/10/")).toBeVisible();

  // Click the same cell to pick the piece back up
  await cell.click();
  await expect(page.locator("text=/0\\/10/")).toBeVisible();
});

test("right-clicking a placed piece removes it", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "C");
  const cell = page.locator(`button[data-row="2"][data-col="0"]`);
  await cell.hover();
  await expect(cell).toHaveCSS("background", /rgba\(110,\s*185,\s*110/);
  await cell.click();
  await expect(page.locator("text=/1\\/10/")).toBeVisible();

  await cell.click({ button: "right" });
  await expect(page.locator("text=/0\\/10/")).toBeVisible({ timeout: 1000 });
});

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

test("Escape cancels piece selection", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "A");
  await expect(page.locator("button[data-row]").first()).toHaveCSS(
    "cursor",
    "crosshair",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("button[data-row]").first()).not.toHaveCSS(
    "cursor",
    "crosshair",
  );
});

test("R rotates the active piece", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "J");
  await page.keyboard.press("r");
  // Piece still active after rotation
  await expect(page.locator("button[data-row]").first()).toHaveCSS(
    "cursor",
    "crosshair",
  );
});

test("F flips the active piece", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "B");
  await page.keyboard.press("f");
  await expect(page.locator("button[data-row]").first()).toHaveCSS(
    "cursor",
    "crosshair",
  );
});

// ─── Reset ────────────────────────────────────────────────────────────────────

test("Reset all removes placed pieces", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "C");
  const cell = page.locator(`button[data-row="2"][data-col="0"]`);
  await cell.hover();
  await expect(cell).toHaveCSS("background", /rgba\(110,\s*185,\s*110/);
  await cell.click();
  await expect(page.locator("text=/1\\/10/")).toBeVisible();

  await clickReset(page);
  await expect(page.locator("text=/0\\/10/")).toBeVisible({ timeout: 1000 });
});

// ─── Solve flow ───────────────────────────────────────────────────────────────

test("Solve button shows confirm modal", async ({ page }) => {
  await clickSolve(page);
  await expect(page.locator("text=Solve the puzzle?")).toBeVisible();
});

test("Cancel in modal dismisses it", async ({ page }) => {
  await clickSolve(page);
  await expect(page.locator("text=Solve the puzzle?")).toBeVisible();
  await dismissModal(page);
  await expect(page.locator("text=Solve the puzzle?")).not.toBeVisible();
});

test("confirming solve fills the board (10/10) and shows solved banner", async ({
  page,
}) => {
  // Set a known date
  await clickCell(page, "Jan");
  await clickCell(page, "1");
  await clickCell(page, "Sun");

  await clickSolve(page);
  await page.locator("text=Solve it").click();

  // Wait for all 10 piece animations (10 × 80 ms + buffer)
  await expect(page.locator("text=/10\\/10/")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=/Solved!/")).toBeVisible({ timeout: 5000 });
});

// ─── Mobile-specific ──────────────────────────────────────────────────────────

test("FloatingControls are hidden on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await selectPiece(page, "A");
  // FloatingControls has `flex md:hidden` — hidden at the md breakpoint on desktop
  await expect(page.locator("text=↻ Rotate")).toBeHidden();
});

test("board does not overflow viewport on mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  const board = page.locator("button[data-row]").first();
  const bb = await board.boundingBox();
  const vw = page.viewportSize()!.width;
  expect(bb!.x + bb!.width).toBeLessThanOrEqual(vw + 2); // 2px tolerance
});

test("FloatingControls appear on mobile when piece is active", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  await page.locator(`button[title="Select piece A"]`).tap();
  await expect(page.locator("text=↻ Rotate")).toBeVisible();
  await expect(page.locator("text=⇄ Flip")).toBeVisible();
  await expect(page.locator("text=✕ Cancel")).toBeVisible();
});

test("FloatingControls Cancel dismisses active piece on mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  await page.locator(`button[title="Select piece A"]`).tap();
  await page.locator("text=✕ Cancel").tap();
  await expect(page.locator("text=↻ Rotate")).not.toBeVisible();
});

test("tapping active piece in tray rotates it on mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  await page.locator(`button[title="Select piece A"]`).tap();
  // Second tap rotates — piece stays active
  await page.locator(`button[title="Select piece A"]`).tap();
  await expect(page.locator("text=↻ Rotate")).toBeVisible();
});
