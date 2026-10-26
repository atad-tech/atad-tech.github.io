/**
 * أسعار الحاسبة وصفحة التكلفة. المصدر الوحيد للأرقام دي.
 * كل الأسعار بالجنيه المصري: [أقل، أكتر].
 */

export type Range = readonly [number, number];

export const PROJECT_TYPES = {
  app: { name: "تطبيق موبايل", hint: "أندرويد وآيفون", price: [50000, 100000], weeks: [8, 12] },
  site: { name: "موقع تعريفي", hint: "للشركة أو العيادة أو البراند", price: [12000, 25000], weeks: [2, 3] },
  store: { name: "متجر إلكتروني", hint: "بيع ودفع أونلاين", price: [25000, 50000], weeks: [4, 6] },
  system: { name: "سيستم إدارة", hint: "حجوزات، حسابات، مخازن", price: [45000, 90000], weeks: [6, 10] },
} as const satisfies Record<string, { name: string; hint: string; price: Range; weeks: Range }>;

export type ProjectType = keyof typeof PROJECT_TYPES;

export const ADDONS = {
  admin: { name: "لوحة تحكم", price: [8000, 14000], benefit: "تعدّل المحتوى والأسعار والطلبات بنفسك من غير مبرمج" },
  pay: { name: "دفع أونلاين", price: [5000, 8000], benefit: "الدفع بالفيزا والمحافظ الإلكترونية جوه الموقع أو التطبيق" },
  accounts: { name: "حسابات للعملاء", price: [4000, 7000], benefit: "العميل يسجّل ويشوف طلباته وبياناته" },
  delivery: { name: "توصيل وتتبع", price: [10000, 18000], benefit: "العميل يتابع طلبه، وإنت تدير المناديب والشحنات" },
  book: { name: "حجز مواعيد", price: [6000, 10000], benefit: "العميل يحجز ميعاد متاح من غير مكالمات" },
  lang: { name: "عربي وإنجليزي", price: [4000, 6000], benefit: "بلغتين، مهم لو بتستهدف عملاء من برّه" },
} as const satisfies Record<string, { name: string; price: Range; benefit: string }>;

export const DESIGN_LEVELS = {
  "1": "بسيط",
  "1.25": "مميز",
  "1.5": "حصري بالكامل",
} as const;

/** سعر الخليج = سعر مصر × mult ثم يتحول للعملة */
export const MARKETS = {
  eg: { label: "مصر", currency: "جنيه", rate: 1, mult: 1 },
  sa: { label: "السعودية", currency: "ريال", rate: 1 / 13, mult: 5 },
  gulf: { label: "باقي الخليج", currency: "دولار", rate: 1 / 50, mult: 5 },
} as const;

export const fmt = (n: number): string => n.toLocaleString("en-US");
export const fmtRange = ([a, b]: Range): string => `${fmt(a)} – ${fmt(b)}`;
