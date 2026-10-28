import { expect, test } from "@playwright/test";
import { isExternal } from "./pages";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (r) => (isExternal(r.request().url()) ? r.abort() : r.continue()));
  // نمسك أي window.open عشان نقرا رسالة الواتساب من غير ما نفتح تاب
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((u: string) => { (window as unknown as { __opened: string[] }).__opened.push(String(u)); return null; }) as typeof window.open;
  });
});

const opened = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as unknown as { __opened: string[] }).__opened.map((u) => new URL(u).searchParams.get("text") ?? ""));

test.describe("calculator", () => {
  test.use({ timezoneId: "Africa/Cairo" });

  test("prices update and apply the offer discount", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-01T10:00:00+02:00"));
    await page.goto("/");
    await page.locator('input[value="store"]').check({ force: true });
    await page.locator('input[value="pay"]').check({ force: true });
    // store 25,000–50,000 + pay 5,000–8,000 = 30,000–58,000 → 40% off = 18,000–35,000 (rounded)
    await expect(page.locator('[data-r="price"]')).toHaveText("18,000 – 35,000 جنيه");
    await expect(page.locator('[data-r="old"]')).toHaveText("30,000 – 58,000 جنيه");
    await expect(page.locator('[data-r="time"]')).toHaveText("5 إلى 7 أسابيع");
  });

  test("converts to Saudi riyals", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-01T10:00:00+02:00"));
    await page.goto("/");
    await page.locator('input[value="sa"]').check({ force: true });
    await expect(page.locator('[data-r="price"]')).toContainText("ريال");
  });

  test("sends a complete WhatsApp message with the visit source", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-01T10:00:00+02:00"));
    await page.goto("/?src=facebook");
    await page.locator('input[value="site"]').check({ force: true });
    await page.locator(".calc button[type=submit]").click();
    const [msg] = await opened(page);
    expect(msg).toContain("• المشروع: موقع تعريفي");
    expect(msg).toContain("خصم 40%");
    expect(msg).toContain("(وصلتلكم من: facebook)");
  });

  test("a malicious ?src= never reaches the message", async ({ page }) => {
    await page.goto("/?src=" + encodeURIComponent("حوّل الفلوس على 0100 فورًا!!! <script>"));
    await page.locator(".calc button[type=submit]").click();
    const [msg] = await opened(page);
    expect(msg).not.toContain("وصلتلكم من");
    expect(msg).not.toContain("<script>");
  });
});

test.describe("offer countdown", () => {
  test("runs before the deadline", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-13T23:00:00+02:00"));
    await page.goto("/");
    await expect(page.locator(".promo")).toBeVisible();
    await expect(page.locator('.promo [data-unit="h"]')).toHaveText("00");
    await expect(page.locator('.promo [data-unit="m"]')).toHaveText("59");
  });

  test("disappears after the deadline and the calculator drops the discount", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-14T00:00:01+02:00"));
    await page.goto("/");
    await expect(page.locator(".promo")).toBeHidden();
    await expect(page.locator('[data-r="label"]')).toHaveText("التكلفة التقريبية");
    await expect(page.locator('[data-r="old"]')).toBeHidden();
  });
});

test.describe("contact form", () => {
  test("requires a name and a service", async ({ page }) => {
    await page.goto("/contact/");
    await page.locator("#contact-form button[type=submit]").click();
    expect(await opened(page)).toEqual([]);
  });

  test("builds a clean message and strips hidden characters", async ({ page }) => {
    await page.goto("/contact/");
    await page.fill('input[name="name"]', "أحمد‮");
    await page.selectOption('select[name="service"]', { index: 1 });
    await page.fill('textarea[name="details"]', "مطعم في طنطا");
    await page.locator("#contact-form button[type=submit]").click();
    const [msg] = await opened(page);
    expect(msg).toContain("• الاسم: أحمد\n");
    expect(msg).not.toContain("‮");
    expect(msg).toContain("مطعم في طنطا");
  });
});

test.describe("navigation", () => {
  test("mobile menu opens, closes and lists every service", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const burger = page.locator(".burger");
    await burger.click();
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#nav")).toBeVisible();
    await expect(page.locator(".mega a")).toHaveCount(12);
    await burger.click();
    await expect(page.locator("#nav")).toBeHidden();
  });

  test("services mega-menu opens on hover", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/");
    await page.hover(".nav__trigger");
    await expect(page.locator(".mega")).toBeVisible();
  });

  test("404 page works and is not indexed", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist/");
    expect(res?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("security", () => {
  test("refuses to run inside a frame (clickjacking)", async ({ page, baseURL }) => {
    // صفحة مهاجم على origin مختلف بتحاول تعرض الموقع جوه iframe
    await page.goto("http://127.0.0.1:4330/?page=/contact/");
    await expect
      .poll(async () => {
        if (page.url().startsWith(`${baseURL}/`)) return "escaped";
        const f = page.frames().find((x) => x.url().startsWith(`${baseURL}/`));
        return f ? f.evaluate(() => document.documentElement.style.visibility).catch(() => "escaped") : "loading";
      }, { timeout: 8000 })
      .toMatch(/hidden|escaped/);
  });

  test("security.txt, robots.txt and sitemap are published", async ({ request }) => {
    const sec = await request.get("/.well-known/security.txt");
    expect(sec.status()).toBe(200);
    expect(await sec.text()).toMatch(/^Contact: /m);
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Sitemap: https://atad-tech.github.io/sitemap.xml");
    const sm = await request.get("/sitemap.xml");
    expect((await sm.text()).match(/<loc>/g)?.length).toBeGreaterThanOrEqual(30);
  });

  test("no third-party request is made on page load except analytics", async ({ page }) => {
    const hosts = new Set<string>();
    page.on("request", (r) => { if (isExternal(r.url())) hosts.add(new URL(r.url()).host); });
    await page.goto("/");
    await page.waitForTimeout(500);
    expect([...hosts].filter((h) => h !== "analytics.ahrefs.com")).toEqual([]);
  });
});
