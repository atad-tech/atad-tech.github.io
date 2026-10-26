/**
 * - يحفظ مصدر الزيارة (?src= أو ?utm_source=) في المتصفح 30 يوم
 * - يضيف المصدر لرسالة أي زرار واتساب عليه data-wa
 * - يسجّل كل ضغطة واتساب كـ Lead في Google Ads وMeta Pixel لو متفعّلين
 */
const KEY = "atad:src";

const TTL = 30 * 24 * 60 * 60 * 1000; // المصدر بيفضل محفوظ 30 يوم

function readSource(): string {
  const qs = new URLSearchParams(location.search);
  const fromUrl = [qs.get("src") || qs.get("utm_source") || "", qs.get("g") || ""].filter(Boolean).join(" / ");
  try {
    if (fromUrl) {
      localStorage.setItem(KEY, JSON.stringify({ v: fromUrl, t: Date.now() }));
      return fromUrl;
    }
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as { v: string; t: number } | null;
    return saved && Date.now() - saved.t < TTL ? saved.v : "";
  } catch {
    return fromUrl;
  }
}

export const source = readSource();

export function withSource(text: string): string {
  return source ? `${text}\n(وصلتلكم من: ${source})` : text;
}

declare global {
  interface Window { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; __atadTrack?: { adsId: string; adsLabel: string } }
}

export function trackLead(kind: string): void {
  try {
    const t = window.__atadTrack;
    if (t?.adsId && t.adsLabel && window.gtag) window.gtag("event", "conversion", { send_to: `${t.adsId}/${t.adsLabel}` });
    if (window.fbq) window.fbq("track", "Lead", { content_name: kind });
  } catch { /* التتبع ما يوقفش الموقع أبدًا */ }
}

function decorate(): void {
  document.querySelectorAll<HTMLAnchorElement>("a[data-wa]").forEach((a) => {
    if (source) {
      const url = new URL(a.href);
      const text = url.searchParams.get("text") || "أهلًا عتاد";
      url.searchParams.set("text", withSource(text));
      a.href = url.toString();
    }
    a.addEventListener("click", () => trackLead(a.dataset["wa"] || "whatsapp"));
  });
}

decorate();
