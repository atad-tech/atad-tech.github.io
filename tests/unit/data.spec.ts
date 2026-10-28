import { expect, test } from "@playwright/test";
import { ADDONS, MARKETS, PROJECT_TYPES } from "../../src/config/pricing";
import { CATEGORIES, SERVICES } from "../../src/data/services";
import { CONTACT, OFFER, SOCIAL } from "../../src/config/site";

test("every service has complete, valid content", () => {
  const slugs = new Set<string>();
  for (const s of SERVICES) {
    expect(s.slug, s.slug).toMatch(/^[a-z0-9-]+$/);
    expect(slugs.has(s.slug), `duplicate slug ${s.slug}`).toBe(false);
    slugs.add(s.slug);
    expect(CATEGORIES[s.category], `${s.slug} category`).toBeTruthy();
    expect(s.seo.title.length, `${s.slug} title`).toBeLessThanOrEqual(70);
    expect(s.seo.description.length, `${s.slug} description`).toBeGreaterThanOrEqual(70);
    expect(s.seo.description.length, `${s.slug} description`).toBeLessThanOrEqual(200);
    expect(s.highlights.length, `${s.slug} highlights`).toBeGreaterThanOrEqual(2);
    expect(s.includes.length, `${s.slug} includes`).toBeGreaterThanOrEqual(3);
    expect(s.faq.length, `${s.slug} faq`).toBeGreaterThanOrEqual(2);
  }
  for (const s of SERVICES) for (const r of s.related) expect(slugs.has(r), `${s.slug} → ${r}`).toBe(true);
});

test("prices are sane ranges", () => {
  for (const [k, t] of Object.entries(PROJECT_TYPES)) {
    expect(t.price[0], k).toBeGreaterThan(0);
    expect(t.price[0], k).toBeLessThan(t.price[1]);
    expect(t.weeks[0], k).toBeLessThanOrEqual(t.weeks[1]);
  }
  for (const [k, a] of Object.entries(ADDONS)) expect(a.price[0], k).toBeLessThan(a.price[1]);
  for (const [k, m] of Object.entries(MARKETS)) expect(m.rate * m.mult, k).toBeGreaterThan(0);
});

test("service priceFrom matches the calculator", () => {
  const map: Record<string, keyof typeof PROJECT_TYPES> = { "mobile-apps": "app", "web-design": "site", ecommerce: "store", systems: "system" };
  for (const [slug, type] of Object.entries(map)) {
    const s = SERVICES.find((x) => x.slug === slug)!;
    expect(s.priceFrom, slug).toBe(PROJECT_TYPES[type].price[0]);
  }
});

test("contact and offer config is valid", () => {
  expect(CONTACT.whatsapp).toMatch(/^\d{10,15}$/);
  expect(CONTACT.phoneE164).toBe(`+${CONTACT.whatsapp}`);
  expect(Number.isNaN(Date.parse(`${OFFER.endsOn}T23:59:59+02:00`))).toBe(false);
  expect(OFFER.percent).toBeGreaterThanOrEqual(0);
  expect(OFFER.percent).toBeLessThan(100);
  for (const url of Object.values(SOCIAL)) expect(url).toMatch(/^https:\/\//);
});

test("every portfolio item is complete, honest and has its images", async () => {
  const { WORK } = await import("../../src/data/work");
  const { existsSync } = await import("node:fs");
  const slugs = new Set<string>();
  const serviceSlugs = new Set(SERVICES.map((s) => s.slug));
  for (const w of WORK) {
    expect(w.slug, w.slug).toMatch(/^[a-z0-9-]+$/);
    expect(slugs.has(w.slug), `duplicate ${w.slug}`).toBe(false);
    slugs.add(w.slug);
    expect(w.seo.title.length, `${w.slug} title`).toBeLessThanOrEqual(70);
    expect(w.seo.description.length, `${w.slug} description`).toBeGreaterThanOrEqual(70);
    expect(w.seo.description.length, `${w.slug} description`).toBeLessThanOrEqual(200);
    // التصميم المفاهيمي لازم يقول كده صراحةً في الوصف، عشان مايتفهمش إنه شغل لعميل
    if (w.kind === "concept") expect(w.seo.description, w.slug).toContain("مفاهيمي");
    expect(w.screens.some((s) => s.file === w.cover), `${w.slug} cover`).toBe(true);
    for (const s of w.screens) {
      expect(s.alt.length, `${w.slug}/${s.file} alt`).toBeGreaterThanOrEqual(20);
      for (const size of [360, 720]) expect(existsSync(`public/work/${w.slug}/${s.file}-${size}.webp`), `${w.slug}/${s.file}-${size}`).toBe(true);
    }
    expect(existsSync(`public/work/${w.slug}/og.jpg`), `${w.slug} og`).toBe(true);
    for (const s of w.services) expect(serviceSlugs.has(s), `${w.slug} → ${s}`).toBe(true);
  }
});

test("guides are complete and their prices match the calculator", async () => {
  const { GUIDES } = await import("../../src/data/guides");
  const { priceIn } = await import("../../src/config/pricing");
  // نفس معادلة الحاسبة: 50,000 جنيه × 5 ÷ 13 = 19,231 ← 19,000 ريال
  expect(priceIn(PROJECT_TYPES.app.price, "sa")).toEqual([19000, 38000]);
  expect(priceIn(PROJECT_TYPES.app.price, "eg")).toEqual(PROJECT_TYPES.app.price);
  const slugs = new Set<string>();
  for (const g of GUIDES) {
    expect(g.slug).toMatch(/^[a-z0-9-]+$/);
    expect(slugs.has(g.slug)).toBe(false);
    slugs.add(g.slug);
    expect(g.seo.title.length, `${g.slug} title`).toBeLessThanOrEqual(75);
    expect(g.seo.description.length, `${g.slug} description`).toBeGreaterThanOrEqual(70);
    expect(g.seo.description.length, `${g.slug} description`).toBeLessThanOrEqual(200);
    expect(g.sections.length, g.slug).toBeGreaterThanOrEqual(3);
    expect(g.faq.length, g.slug).toBeGreaterThanOrEqual(3);
    expect(new Set(g.sections.map((s) => s.id)).size, `${g.slug} section ids`).toBe(g.sections.length);
    expect(g.updated >= g.published, g.slug).toBe(true);
    expect(g.seo.title + g.title, `${g.slug} keyword in title`).toContain(g.keyword.split(" ")[0]!);
  }
});
