/**
 * تنضيف أي مدخلات جاية من برّه (الرابط، التخزين المحلي، data-*)
 * قبل ما تتحط في رسالة واتساب أو رابط سكريبت.
 */

/** مصدر الزيارة (?src=): حروف وأرقام وفواصل بسيطة بس، وبحد أقصى 40 حرف. */
export function safeSource(raw: string | null | undefined): string {
  if (!raw) return "";
  const v = raw.normalize("NFKC").trim();
  return /^[\p{L}\p{N} _.\-/]{1,40}$/u.test(v) ? v : "";
}

/** أكواد التتبع (AW-123 / 1234567): حروف إنجليزي وأرقام وشرطة بس. */
export function safeId(raw: string | null | undefined): string {
  if (!raw) return "";
  return /^[A-Za-z0-9-]{3,40}$/.test(raw) ? raw : "";
}

/** نص حر من نموذج التواصل: بنشيل حروف التحكم ونقص الطول. */
export function safeText(raw: string | null | undefined, max = 600): string {
  if (!raw) return "";
  return raw.normalize("NFKC").replace(/[\u0000-\u0008\u000B-\u001F\u007F‪-‮⁦-⁩]/g, "").trim().slice(0, max);
}
