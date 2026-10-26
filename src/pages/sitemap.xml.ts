import type { APIRoute } from "astro";
import { SERVICES } from "@/data/services";
import { absolute, servicePath } from "@/lib/url";

// بيتولد وقت البناء، فأي خدمة جديدة بتدخل الـ sitemap لوحدها
const pages: { path: string; priority: string }[] = [
  { path: "/", priority: "1.0" },
  { path: "/services/", priority: "0.9" },
  ...SERVICES.map((s) => ({ path: servicePath(s.slug), priority: s.featured ? "0.9" : "0.8" })),
  { path: "/website-cost/", priority: "0.9" },
  { path: "/about/", priority: "0.6" },
  { path: "/contact/", priority: "0.6" },
  { path: "/privacy/", priority: "0.2" },
  { path: "/terms/", priority: "0.2" },
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${absolute(p.path)}</loc><lastmod>${lastmod}</lastmod><priority>${p.priority}</priority></url>`).join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
