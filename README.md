# عتاد ATAD — موقع الشركة

[![Test & deploy](https://github.com/atad-tech/atad-tech.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/atad-tech/atad-tech.github.io/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/atad-tech/atad-tech.github.io/actions/workflows/codeql.yml/badge.svg)](https://github.com/atad-tech/atad-tech.github.io/actions/workflows/codeql.yml)

**https://atad-tech.github.io**

موقع ثابت مبني بـ [Astro](https://astro.build) وTypeScript (strictest). بينزل على GitHub Pages أوتوماتيك، بس بعد ما يعدّي على 339 اختبار وفحص أمني.

- 📐 [هيكل الموقع بالرسومات](docs/ARCHITECTURE.md)
- 🔒 [نموذج الأمان والتهديدات](docs/SECURITY-MODEL.md)
- 🛡️ [الإبلاغ عن ثغرة](SECURITY.md)

## التشغيل محليًا

يحتاج Node ‎22.23.4 أو أحدث.

```bash
npm ci --ignore-scripts
npx playwright install chromium   # مرة واحدة
npm run dev        # http://localhost:4321/
npm run build      # فحص الأنواع + البناء في dist/
npm test           # كل الاختبارات (بعد build)
```

## هتعدّل فين

| عايز تغيّر | الملف |
| --- | --- |
| رقم الواتساب، السوشيال، العرض وتاريخه، أكواد التتبع | `src/config/site.ts` |
| أسعار الحاسبة وصفحة الأسعار | `src/config/pricing.ts` |
| محتوى الخدمات (صفحة لكل خدمة بتتبني أوتوماتيك) | `src/data/services.ts` |
| أعمالنا (مشاريع وتصاميم مفاهيمية، الصور في `public/work/`) | `src/data/work.ts` |
| الأدلة والمقالات (الأسعار فيها بتتحسب من الحاسبة) | `src/data/guides.ts` |
| تاريخ آخر تعديل في الـ sitemap | `CONTENT_UPDATED` في `src/pages/sitemap.xml.ts` |
| الألوان والخطوط والمسافات | `src/styles/global.css` |
| سياسة الأمان (CSP) | `astro.config.ts` |

## الرابط القديم

`mostafaer.github.io/atad/...` بيحوّل لنفس الصفحة هنا (ريبو `mostafaer/atad`).
