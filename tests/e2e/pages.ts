import { SERVICES } from "../../src/data/services";
import { WORK } from "../../src/data/work";

/** كل صفحات الموقع اللي لازم تتختبر. أي خدمة جديدة بتدخل هنا أوتوماتيك. */
export const PAGES: string[] = [
  "/",
  "/services/",
  "/website-cost/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/work/",
  ...SERVICES.map((s) => `/${s.slug}/`),
  ...WORK.map((w) => `/work/${w.slug}/`),
];

/** أي طلب لبرّه الموقع أثناء الاختبار بيتقفل، عشان الاختبار يبقى ثابت ومايبعتش زيارات وهمية للتحليلات. */
export const isExternal = (url: string): boolean => !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url) && !url.startsWith("data:");
