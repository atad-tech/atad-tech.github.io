# عتاد ATAD — موقع الشركة

موقع ثابت مبني بـ [Astro](https://astro.build) وTypeScript، وبينزل على GitHub Pages أوتوماتيك مع كل push على `main`.

## التشغيل محليًا

```bash
npm ci
npm run dev      # http://localhost:4321/
npm run build    # astro check + build في dist/
```

## هتعدّل فين

| عايز تغيّر | الملف |
| --- | --- |
| رقم الواتساب، السوشيال، العرض وتاريخه، أكواد التتبع | `src/config/site.ts` |
| أسعار الحاسبة وصفحة الأسعار | `src/config/pricing.ts` |
| محتوى الخدمات (صفحة لكل خدمة بتتبني أوتوماتيك) | `src/data/services.ts` |
| الألوان والخطوط والمسافات | `src/styles/global.css` |

إضافة خدمة جديدة = عنصر جديد في `SERVICES`. الصفحة والقوائم والفوتر والـ sitemap والـ Schema بيتحدثوا لوحدهم.

## الهيكل

```
src/
  config/       إعدادات الموقع والأسعار (مصدر واحد للأرقام)
  data/         محتوى الخدمات
  layouts/      BaseLayout: SEO، Open Graph، JSON-LD، التتبع
  components/   Header، Footer، Calculator، Countdown، FAQ، CTA…
  pages/        الصفحات + [service].astro (قالب كل الخدمات) + sitemap.xml.ts
  scripts/      كود المتصفح: العداد التنازلي، تتبع مصدر الزيارة ورسايل واتساب
  lib/          روابط تحترم الـ base، وبناء الـ Schema
public/         صور ولوجو وملفات التحقق
```

## دومين خاص

في `astro.config.mjs` غيّر `SITE_URL` للدومين، وحدّث `public/robots.txt`، وضيف ملف `public/CNAME` فيه الدومين.

الرابط القديم `mostafaer.github.io/atad` بيحوّل أوتوماتيك على الموقع ده (ريبو `mostafaer/atad`).
