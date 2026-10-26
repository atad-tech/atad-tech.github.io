/**
 * - يحفظ مصدر الزيارة (?src= أو ?utm_source=) في المتصفح 30 يوم
 * - يضيف المصدر لرسالة أي زرار واتساب عليه data-wa
 * - يسجّل كل ضغطة واتساب كـ Lead في Google Ads وMeta Pixel لو متفعّلين
 *
 * المصدر بيتنضف قبل الاستخدام (safeSource)، عشان محدش يقدر يبعت رابط
 * فيه نص طويل أو مضلل يتحط في رسالة الواتساب اللي العميل بيبعتها.
 */
import { safeId, safeSource } from "@/lib/sanitize";

const KEY = "atad:src";
const TTL = 30 * 24 * 60 * 60 * 1000; // 30 يوم
const WA_HOST = "wa.me";

function readSource(): string {
  const qs = new URLSearchParams(location.search);
  const fromUrl = safeSource([qs.get("src") || qs.get("utm_source") || "", qs.get("g") || ""].filter(Boolean).join(" / "));
  try {
    if (fromUrl) {
      localStorage.setItem(KEY, JSON.stringify({ v: fromUrl, t: Date.now() }));
      return fromUrl;
    }
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object" && "v" in saved && "t" in saved && typeof saved.t === "number" && Date.now() - saved.t < TTL) {
      return safeSource(String(saved.v));
    }
    return "";
  } catch {
    return fromUrl;
  }
}

export const source = readSource();

export function withSource(text: string): string {
  return source ? `${text}\n(وصلتلكم من: ${source})` : text;
}

export function trackLead(kind: string): void {
  try {
    const ds = document.documentElement.dataset;
    const adsId = safeId(ds["adsId"]);
    const adsLabel = safeId(ds["adsLabel"]);
    if (adsId && adsLabel && window.gtag) window.gtag("event", "conversion", { send_to: `${adsId}/${adsLabel}` });
    if (window.fbq) window.fbq("track", "Lead", { content_name: kind.slice(0, 40) });
  } catch {
    /* التتبع ما يوقفش الموقع أبدًا */
  }
}

/** بيفتح واتساب في تاب جديد من غير ما الصفحة الجديدة تقدر توصل للموقع (noopener). */
export function openWhatsApp(number: string, text: string): void {
  if (!/^\d{8,15}$/.test(number)) return;
  const url = new URL(`https://${WA_HOST}/${number}`);
  url.searchParams.set("text", text);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

function decorate(): void {
  document.querySelectorAll<HTMLAnchorElement>("a[data-wa]").forEach((a) => {
    let url: URL;
    try { url = new URL(a.href); } catch { return; }
    if (url.hostname !== WA_HOST) return; // بنعدّل روابط واتساب بس
    if (source) {
      url.searchParams.set("text", withSource(url.searchParams.get("text") || "أهلًا عتاد"));
      a.href = url.toString();
    }
    a.addEventListener("click", () => trackLead(a.dataset["wa"] || "whatsapp"));
  });
}

decorate();
