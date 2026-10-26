import { defineConfig, devices } from "@playwright/test";

const PORT = 4329;
export const ATTACKER_PORT = 4330;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    // ما نحمّلش سكريبتات تتبع حقيقية وقت الاختبار
    serviceWorkers: "block",
  },
  projects: [
    { name: "unit", testMatch: /unit\/.*\.spec\.ts/ },
    { name: "desktop", testMatch: /e2e\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"], locale: "ar-EG", timezoneId: "Africa/Cairo" } },
    { name: "mobile", testMatch: /e2e\/.*\.spec\.ts/, use: { ...devices["Pixel 7"], locale: "ar-EG", timezoneId: "Africa/Cairo" } },
  ],
  // بنختبر الموقع بعد البناء بالظبط زي ما هيتنشر
  webServer: [
    {
      command: `npx astro preview --port ${PORT} --host 127.0.0.1 --ignore-lock`,
      url: `http://127.0.0.1:${PORT}/`,
      reuseExistingServer: !process.env["CI"],
      timeout: 60_000,
    },
    {
      // origin تاني لاختبار الـ Clickjacking
      command: `node tests/fixtures/attacker-server.mjs ${ATTACKER_PORT} http://127.0.0.1:${PORT}`,
      url: `http://127.0.0.1:${ATTACKER_PORT}/`,
      reuseExistingServer: !process.env["CI"],
    },
  ],
});
