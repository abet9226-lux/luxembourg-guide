const { test, expect } = require("@playwright/test");

test("home shows events first (cards default)", async ({ page }) => {
  await page.goto("/app/index.html#/events");
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
  await expect(page.getByText("Sorted by soonest upcoming first")).toBeVisible();
  await expect(page.locator(".grid")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/home-cards.png", fullPage: true });
});

test("toggle to list view", async ({ page }) => {
  await page.goto("/app/index.html#/events");
  await page.getByRole("button", { name: "List" }).click();
  await expect(page.locator("table.table")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/home-list.png", fullPage: true });
});

test("search filters results", async ({ page }) => {
  await page.goto("/app/index.html#/events");
  await page.getByPlaceholder("Search events…").fill("jazz");
  await expect(page.getByText("Summer Jazz Night")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/search-jazz.png", fullPage: true });
});

test("category filter works (Music)", async ({ page }) => {
  await page.goto("/app/index.html#/events");
  await page.getByLabel("Category filter").selectOption("Music");
  await expect(page.getByText("Summer Jazz Night")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/filter-music.png", fullPage: true });
});

test("open event details and see ticket link", async ({ page }) => {
  await page.goto("/app/index.html#/events");
  await page.getByRole("link", { name: "View details" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Tickets \/ Book/i })).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/details.png", fullPage: true });
});

test("destinations page loads", async ({ page }) => {
  await page.goto("/app/index.html#/destinations");
  await expect(page.getByRole("heading", { name: "Destinations" })).toBeVisible();
  await expect(page.locator(".grid")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/destinations.png", fullPage: true });
});

test("open destination details", async ({ page }) => {
  await page.goto("/app/index.html#/destinations");
  await page.getByRole("link", { name: "View details" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Actions")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/destination-details.png", fullPage: true });
});

