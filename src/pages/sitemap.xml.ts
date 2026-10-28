import type { APIRoute } from "astro";
import { SERVICES } from "@/data/services";
import { WORK, screenSrc, workPath } from "@/data/work";
import { GUIDES, guidePath } from "@/data/guides";
import { absolute, servicePath } from "@/lib/url";

/**
 * آخر تعديل حقيقي للمحتوى. جوجل بيتجاهل lastmod لو كان دايمًا "النهارده"،
 * فبنحدّث التاريخ ده بإيدينا لما المحتوى يتغير فعلًا.
 */
const CONTENT_UPDATED = "2026-10-28";

interface Entry { path: string; priority: string; lastmod?: string; images?: { loc: string; title: string }[] }

// بيتولد وقت البناء، فأي خدمة أو عمل أو مقال جديد بيدخل الـ sitemap لوحده
const pages: Entry[] = [
  { path: "/", priority: "1.0" },
  { path: "/services/", priority: "0.9" },
  ...SERVICES.map((s) => ({ path: servicePath(s.slug), priority: s.featured ? "0.9" : "0.8" })),
  { path: "/website-cost/", priority: "0.9" },
  { path: "/guides/", priority: "0.7" },
  ...GUIDES.map((g) => ({ path: guidePath(g.slug), priority: "0.8", lastmod: g.updated })),
  { path: "/work/", priority: "0.8" },
  ...WORK.map((w) => ({
    path: workPath(w.slug),
    priority: "0.7",
    images: w.screens.map((s) => ({ loc: absolute(screenSrc(w, s.file, 720)), title: `${w.title} – ${s.label}` })),
  })),
  { path: "/about/", priority: "0.6" },
  { path: "/contact/", priority: "0.6" },
  { path: "/privacy/", priority: "0.2" },
  { path: "/terms/", priority: "0.2" },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .map((p) => {
    const imgs = (p.images ?? []).map((i) => `<image:image><image:loc>${esc(i.loc)}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`).join("");
    return `  <url><loc>${absolute(p.path)}</loc><lastmod>${p.lastmod ?? CONTENT_UPDATED}</lastmod><priority>${p.priority}</priority>${imgs}</url>`;
  })
  .join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
