// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    screenshot: "on",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run serve",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
});

