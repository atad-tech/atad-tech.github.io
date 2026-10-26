/**
 * إعدادات الموقع كلها في مكان واحد.
 * أي رقم أو رابط أو عرض بيتغيّر من هنا بس، وكل الصفحات بتقرا منه.
 */

export const SITE = {
  name: "عتاد ATAD",
  legalName: "عتاد ATAD للبرمجيات",
  alternateNames: ["ATAD Software Engineering", "عتاد للبرمجيات", "ATAD"],
  tagline: "تطبيقات ومواقع وتسويق رقمي بتصميم خاص لبراندك",
  description:
    "عتاد للبرمجيات: برمجة تطبيقات موبايل، تصميم مواقع ومتاجر إلكترونية، أنظمة إدارة، تسويق رقمي وإعلانات، تصميم هوية، واستضافة. لعملاء في مصر والسعودية والخليج.",
  locale: "ar_EG",
  lang: "ar",
  areaServed: ["Egypt", "Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Bahrain", "Oman"],
} as const;

export const CONTACT = {
  /** بالصيغة الدولية من غير + ولا مسافات */
  whatsapp: "201104549752",
  phoneDisplay: "+20 110 454 9752",
  phoneE164: "+201104549752",
} as const;

export const SOCIAL = {
  facebook: "https://www.facebook.com/1394276123762762",
  instagram: "https://www.instagram.com/atad.tech/",
} as const;

/** عرض الإطلاق. خلّي percent = 0 عشان تلغيه. التاريخ بتوقيت القاهرة. */
export const OFFER = {
  percent: 40,
  endsOn: "2026-12-13",
  label: "على أول مشروع ليك معانا",
} as const;

/** تتبع الإعلانات (اختياري). سيبهم فاضيين لحد ما تبدأ إعلانات. */
export const TRACKING = {
  ahrefsKey: "iZejlHC0HsEf+FW9J866cw",
  ahrefsVerification: "9039b1263a87d7bfafbfb622a963b08af9e36fb7dcda519870634e51393c3979",
  googleAdsId: "",
  googleAdsLabel: "",
  metaPixelId: "",
} as const;

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
