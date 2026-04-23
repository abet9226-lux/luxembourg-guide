const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("luxguide.tour.events.v1", "skipped");
    localStorage.setItem("luxguide.tour.destinations.v1", "skipped");
  });
});

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

test("destinations filters work", async ({ page }) => {
  await page.goto("/app/index.html#/destinations");
  await page.getByLabel("Destination type filter").selectOption("Museum");
  await expect(page.getByText("National Museum (Sample)")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/destinations-filter-museum.png", fullPage: true });
});

test("destinations supports list view", async ({ page }) => {
  await page.goto("/app/index.html#/destinations");
  await page.getByRole("button", { name: "List" }).click();
  await expect(page.locator("table.table")).toBeVisible();
  await page.screenshot({ path: "tests/e2e/screenshots/destinations-list-view.png", fullPage: true });
});

test.describe("first-run information tour", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("luxguide.tour.events.v1");
      localStorage.setItem("luxguide.tour.destinations.v1", "skipped");
    });
  });

  test("welcome dialog appears and can finish", async ({ page }) => {
    await page.goto("/app/index.html#/events");
    await expect(page.getByRole("dialog", { name: "Welcome to Luxembourg Guide" })).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("dialog", { name: "Events and destinations" })).toBeVisible();
    const dlg = page.getByRole("dialog");
    for (let i = 0; i < 8; i += 1) {
      const done = dlg.getByRole("button", { name: "Done", exact: true });
      if (await done.isVisible()) {
        await done.click();
        break;
      }
      await dlg.getByRole("button", { name: "Next", exact: true }).click();
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("luxguide.tour.events.v1"))).toBe("done");
  });

  test("replay tour button restarts after skip", async ({ page }) => {
    await page.goto("/app/index.html#/events");
    await page.getByRole("button", { name: "Skip tour", exact: true }).click();
    await page.locator("#tourReplayBtn").click();
    await expect(page.getByRole("dialog", { name: "Welcome to Luxembourg Guide" })).toBeVisible();
  });
});

test.describe("first-run destinations tour", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("luxguide.tour.events.v1", "skipped");
      localStorage.removeItem("luxguide.tour.destinations.v1");
    });
  });

  test("destinations tour appears and can finish", async ({ page }) => {
    await page.goto("/app/index.html#/destinations");
    await expect(page.getByRole("dialog", { name: "Destinations tour" })).toBeVisible();
    const dlg = page.getByRole("dialog");
    for (let i = 0; i < 8; i += 1) {
      const done = dlg.getByRole("button", { name: "Done", exact: true });
      if (await done.isVisible()) {
        await done.click();
        break;
      }
      await dlg.getByRole("button", { name: "Next", exact: true }).click();
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("luxguide.tour.destinations.v1"))).toBe("done");
  });
});

