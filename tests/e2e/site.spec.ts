import { expect, test, type Page } from "@playwright/test";
import { PAGES, isExternal } from "./pages";

/** بيفتح الصفحة ويجمع أي خطأ JS أو مخالفة CSP أو مورد مكسور. */
async function visit(page: Page, path: string) {
  const problems: string[] = [];
  await page.route("**/*", (route) => (isExternal(route.request().url()) ? route.abort() : route.continue()));
  page.on("pageerror", (e) => problems.push(`JS: ${e.message}`));
  page.on("console", (m) => {
    const t = m.text();
    if (/Content Security Policy|Refused to/i.test(t)) problems.push(`CSP: ${t}`);
    else if (m.type() === "error" && !/ERR_FAILED|net::ERR_BLOCKED/.test(t)) problems.push(`console: ${t}`);
  });
  page.on("response", (r) => {
    if (!isExternal(r.url()) && r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  const res = await page.goto(path, { waitUntil: "load" });
  expect(res?.status(), path).toBe(200);
  return problems;
}

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test("loads with no JS errors, CSP violations or broken assets", async ({ page }) => {
      const problems = await visit(page, path);
      await page.waitForTimeout(300);
      expect(problems, problems.join("\n")).toEqual([]);
    });

    test("has correct SEO and security tags", async ({ page }) => {
      await visit(page, path);
      await expect(page).toHaveTitle(/.{15,}/);
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(desc?.length ?? 0).toBeGreaterThanOrEqual(40);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://atad-tech.github.io${path}`);
      await expect(page.locator("h1")).toHaveCount(1);
      const csp = await page.locator('meta[http-equiv="content-security-policy"]').getAttribute("content");
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
      await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "strict-origin-when-cross-origin");
      for (const raw of await page.locator('script[type="application/ld+json"]').allTextContents()) {
        expect(() => JSON.parse(raw)).not.toThrow();
      }
    });

    test("every link is safe and every internal link exists", async ({ page, request }) => {
      await visit(page, path);
      const links = await page.locator("a[href]").evaluateAll((as) =>
        as.map((a) => ({ href: (a as HTMLAnchorElement).href, target: a.getAttribute("target"), rel: a.getAttribute("rel") ?? "" })),
      );
      expect(links.length).toBeGreaterThan(10);
      for (const l of links) {
        expect(l.href, "no javascript: links").not.toMatch(/^javascript:/i);
        if (l.target === "_blank") expect(l.rel, l.href).toContain("noopener");
        const u = new URL(l.href);
        if (u.protocol.startsWith("http") && !isExternal(l.href)) {
          const r = await request.get(u.pathname);
          expect(r.status(), u.pathname).toBe(200);
        } else if (u.protocol.startsWith("http")) {
          expect(u.protocol, l.href).toBe("https:");
        }
      }
    });

    test("fits the screen with no horizontal scroll", async ({ page }) => {
      await visit(page, path);
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw).toBeLessThanOrEqual(cw);
    });

    test("images have alt text and buttons have names", async ({ page }) => {
      await visit(page, path);
      expect(await page.locator("img:not([alt])").count()).toBe(0);
      for (const b of await page.locator("button, a.btn, a.wa-float").all()) {
        const name = (await b.getAttribute("aria-label")) ?? (await b.innerText());
        expect(name.trim().length, await b.evaluate((e) => e.outerHTML.slice(0, 120))).toBeGreaterThan(0);
      }
    });
  });
}
