import { SERVICES } from "../../src/data/services";

/** كل صفحات الموقع اللي لازم تتختبر. أي خدمة جديدة بتدخل هنا أوتوماتيك. */
export const PAGES: string[] = [
  "/",
  "/services/",
  "/website-cost/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/terms/",
  ...SERVICES.map((s) => `/${s.slug}/`),
];

/** أي طلب لبرّه الموقع أثناء الاختبار بيتقفل، عشان الاختبار يبقى ثابت ومايبعتش زيارات وهمية للتحليلات. */
export const isExternal = (url: string): boolean => !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url) && !url.startsWith("data:");
