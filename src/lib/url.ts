/** روابط داخلية بتحترم الـ base (/atad) عشان الموقع يشتغل لو اتنقل لدومين خاص. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function href(path = "/"): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const [p = "", hash] = path.split("#");
  const clean = p.startsWith("/") ? p : `/${p}`;
  const withSlash = clean.endsWith("/") || clean.includes(".") ? clean : `${clean}/`;
  return `${BASE}${withSlash}${hash !== undefined ? `#${hash}` : ""}`;
}

export function absolute(path = "/"): string {
  return new URL(href(path), import.meta.env.SITE).toString();
}

export const servicePath = (slug: string): string => `/${slug}/`;
