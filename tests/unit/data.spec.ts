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
