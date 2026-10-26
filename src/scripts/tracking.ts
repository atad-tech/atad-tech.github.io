/**
 * تحميل Google Ads وMeta Pixel لو أكوادهم متحطة في src/config/site.ts.
 * الأكواد بتيجي من data-* على <html>، فمفيش أي كود inline في الصفحة،
 * ومصادرهم بتتضاف للـ CSP أوتوماتيك وقت البناء (astro.config.ts).
 */
import { safeId } from "@/lib/sanitize";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string };
  }
}

function loadScript(src: string): void {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  s.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.appendChild(s);
}

const ds = document.documentElement.dataset;
const adsId = safeId(ds["adsId"]);
const pixelId = safeId(ds["pixelId"]);

if (adsId) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => { window.dataLayer!.push(args); };
  window.gtag("js", new Date());
  window.gtag("config", adsId);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(adsId)}`);
}

if (pixelId && !window.fbq) {
  const queue: unknown[] = [];
  const fbq = Object.assign((...args: unknown[]) => { queue.push(args); }, { queue, loaded: true, version: "2.0" });
  window.fbq = fbq;
  fbq("init", pixelId);
  fbq("track", "PageView");
  loadScript("https://connect.facebook.net/en_US/fbevents.js");
}
