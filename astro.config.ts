import { defineConfig } from "astro/config";
import { TRACKING } from "./src/config/site";

// الموقع منشور على https://atad-tech.github.io (الجذر).
// لما يبقى فيه دومين خاص: غيّر SITE_URL بس، وضيف public/CNAME.
const SITE_URL = "https://atad-tech.github.io";

/**
 * Content-Security-Policy
 * Astro بيحسب hash لكل script وstyle في الصفحة ويحطهم في <meta> أوتوماتيك،
 * فأي كود متحقن مش من البناء نفسه مش هيشتغل.
 * المصادر الخارجية مسموحة بس لأدوات التتبع اللي متفعّلة في src/config/site.ts.
 */
const pick = (pairs: [unknown, string][]): string[] => pairs.filter(([on]) => Boolean(on)).map(([, host]) => host);

const scriptHosts = pick([
  [TRACKING.ahrefsKey, "https://analytics.ahrefs.com"],
  [TRACKING.googleAdsId, "https://www.googletagmanager.com"],
  [TRACKING.metaPixelId, "https://connect.facebook.net"],
]);
const connectHosts = pick([
  [TRACKING.ahrefsKey, "https://analytics.ahrefs.com"],
  [TRACKING.googleAdsId, "https://www.google.com https://googleads.g.doubleclick.net https://www.googletagmanager.com"],
  [TRACKING.metaPixelId, "https://www.facebook.com"],
]);
const imgHosts = pick([
  [TRACKING.googleAdsId, "https://www.google.com https://googleads.g.doubleclick.net"],
  [TRACKING.metaPixelId, "https://www.facebook.com"],
]);
const withHosts = <D extends string>(base: D, hosts: string[]): D => [base, ...hosts].join(" ") as D;

export default defineConfig({
  site: SITE_URL,
  base: "/",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  // كل الأصول (خطوط وصور) بتتنشر كملفات، مش data: URIs، عشان الـ CSP تفضل صارمة
  vite: { build: { assetsInlineLimit: 0 } },
  security: {
    csp: {
      algorithm: "SHA-384",
      directives: [
        "default-src 'self'",
        withHosts("img-src 'self' data:", imgHosts),
        "font-src 'self'",
        withHosts("connect-src 'self'", connectHosts),
        "manifest-src 'self'",
        "media-src 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "worker-src 'none'",
        "child-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ],
      scriptDirective: { resources: ["'self'", ...scriptHosts] },
      styleDirective: { resources: ["'self'"] },
    },
  },
});
