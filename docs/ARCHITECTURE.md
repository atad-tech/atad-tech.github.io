# هيكل موقع عتاد ATAD

الموقع **ثابت بالكامل (Static)**: مفيش سيرفر، ولا قاعدة بيانات، ولا لوحة تسجيل دخول. كل صفحة بتتبني مرة واحدة وقت النشر وتتحول لملف HTML جاهز، وده أكبر سبب إن الموقع سريع وصعب يتخترق.

## 1. الصورة الكاملة

```mermaid
flowchart LR
    subgraph Dev["التطوير"]
        Code["الكود<br/>atad-tech/atad-tech.github.io"]
    end
    subgraph CI["GitHub Actions"]
        Test["فحص + بناء + 268 اختبار"]
        Scan["CodeQL + npm audit<br/>+ Dependabot"]
    end
    subgraph Host["GitHub Pages (HTTPS)"]
        Site["atad-tech.github.io<br/>24 صفحة HTML ثابتة"]
        Old["mostafaer.github.io/atad<br/>تحويل للعنوان الجديد"]
    end
    Visitor(["الزائر"])
    WA["wa.me<br/>واتساب عتاد"]
    Ahrefs["Ahrefs Analytics"]

    Code -->|push| Test
    Code --> Scan
    Test -->|"لو كله نجح"| Site
    Visitor -->|"يفتح الموقع"| Site
    Visitor -.->|"لينك قديم"| Old -.->|"نفس الصفحة + ?src"| Site
    Site -->|"زرار / حاسبة / فورم"| WA
    Site -.->|"إحصائيات مجهّلة"| Ahrefs
```

## 2. خط النشر

أي تعديل لازم يعدّي على كل المراحل دي بالترتيب. لو أي مرحلة فشلت، النشر بيقف والموقع القديم يفضل شغال.

```mermaid
flowchart TD
    A["push على main"] --> B["npm ci --ignore-scripts<br/>تثبيت من غير تشغيل أي كود خارجي"]
    B --> C{"npm audit<br/>فيه ثغرات؟"}
    C -->|أيوه| X["❌ وقف"]
    C -->|لأ| D{"astro check<br/>TypeScript strictest"}
    D -->|أخطاء| X
    D -->|سليم| E["astro build<br/>+ توليد CSP hashes"]
    E --> F{"اختبارات الوحدة<br/>الأسعار، التنضيف، البيانات"}
    F -->|فشل| X
    F -->|نجح| G{"اختبارات المتصفح<br/>كل صفحة × موبايل وديسكتوب"}
    G -->|فشل| X
    G -->|نجح| H["✅ نشر على GitHub Pages"]
```

## 3. هيكل الكود

البيانات في مكان، والشكل في مكان، والصفحات بتتولد منهم. عشان كده تعديل سعر أو إضافة خدمة بيحصل في سطر واحد.

```mermaid
flowchart TD
    subgraph Data["مصادر البيانات — المكان الوحيد للتعديل"]
        Site["config/site.ts<br/>التواصل، العرض، التتبع"]
        Price["config/pricing.ts<br/>أسعار الحاسبة"]
        Svc["data/services.ts<br/>محتوى 12 خدمة"]
    end
    subgraph Lib["lib/"]
        Url["url.ts<br/>روابط"]
        Schema["schema.ts<br/>بيانات جوجل المنظمة"]
        San["sanitize.ts<br/>تنضيف المدخلات"]
    end
    subgraph UI["components/"]
        Layout["BaseLayout<br/>SEO + CSP + Header/Footer"]
        Calc["Calculator"]
        Parts["Header · Footer · ServiceCard<br/>Faq · CtaBand · Countdown"]
    end
    subgraph Pages["pages/ → صفحات HTML"]
        Home["/ الرئيسية"]
        SvcPage["[service].astro<br/>→ 12 صفحة خدمة"]
        Others["services · website-cost · about<br/>contact · privacy · terms · 404"]
        SM["sitemap.xml"]
    end
    subgraph Browser["scripts/ — كود المتصفح"]
        Guard["guard.ts<br/>ضد Clickjacking"]
        Offer["offer.ts<br/>العداد"]
        Lead["lead.ts<br/>مصدر الزيارة + واتساب"]
        Track["tracking.ts<br/>Ads / Pixel"]
    end

    Site & Price & Svc --> UI
    Svc --> SvcPage & SM
    Lib --> UI
    UI --> Pages
    Layout --> Browser
    San --> Lead & Track
```

| المجلد | فيه إيه |
| --- | --- |
| `src/config/` | الإعدادات والأسعار. **أي رقم بيتغير من هنا بس.** |
| `src/data/` | محتوى الخدمات كبيانات مكتوبة بأنواع TypeScript |
| `src/layouts/` | القالب الأساسي لكل صفحة |
| `src/components/` | الأجزاء المتكررة |
| `src/pages/` | كل ملف = صفحة. `[service].astro` بيولّد صفحة لكل خدمة |
| `src/scripts/` | الكود اللي بيشتغل في متصفح الزائر |
| `src/lib/` | أدوات مشتركة |
| `tests/unit/` | اختبارات الأسعار والبيانات والتنضيف |
| `tests/e2e/` | اختبارات كل صفحة في متصفح حقيقي |

## 4. رحلة العميل: من الإعلان لرسالة الواتساب

```mermaid
sequenceDiagram
    actor C as العميل
    participant FB as بوست فيسبوك
    participant S as الموقع
    participant LS as المتصفح (localStorage)
    participant W as واتساب عتاد

    C->>FB: يضغط على اللينك
    FB->>S: atad-tech.github.io/?src=facebook
    S->>S: safeSource() بتنضف المصدر
    S->>LS: تحفظ "facebook" 30 يوم
    C->>S: يختار المشروع والمميزات في الحاسبة
    S->>S: تحسب السعر + خصم 40% لو العرض شغال
    C->>S: "ابعتلي عرض سعر على واتساب"
    S->>W: رسالة جاهزة فيها التفاصيل + "(وصلتلكم من: facebook)"
    Note over S,W: مفيش أي بيانات بتتحفظ على الموقع.<br/>العميل هو اللي بيضغط إرسال في واتساب.
```

## 5. تكوين أي صفحة

```mermaid
flowchart TD
    HTML["&lt;html dir=rtl&gt;<br/>data-offer-end, data-ads-id …"] --> Head & Body
    Head["&lt;head&gt;"] --> M1["title · description · canonical"]
    Head --> M2["Content-Security-Policy (hashes)"]
    Head --> M3["Open Graph · Twitter · JSON-LD"]
    Body["&lt;body&gt;"] --> Promo["شريط العرض + العداد"]
    Body --> Header["Header + قائمة الخدمات"]
    Body --> Main["&lt;main&gt; محتوى الصفحة"]
    Body --> Footer["Footer: كل الخدمات + روابط"]
    Body --> Float["زرار واتساب العائم"]
    Body --> JS["سكريبتات: guard → offer → lead → tracking"]
```

## 6. الاختبارات

| النوع | بيتأكد من إيه | العدد |
| --- | --- | --- |
| وحدة | الأسعار منطقية، الخدمات كاملة، أسعار "يبدأ من" = الحاسبة، تنضيف المدخلات ضد الحقن | 11 |
| كل صفحة × موبايل وديسكتوب | بتفتح 200، مفيش أخطاء JS، مفيش مخالفة CSP، مفيش ملف مكسور، SEO كامل، H1 واحد، كل الروابط الداخلية شغالة، مفيش سكرول أفقي، الصور عليها alt، الزراير ليها أسماء | 190 |
| وظائف × موبايل وديسكتوب | حساب الحاسبة بالأرقام، تحويل الريال، رسالة واتساب كاملة، رفض `?src=` الخبيث، العداد قبل وبعد الموعد، الفورم، المنيو، 404، Clickjacking، security.txt، مفيش طلبات لطرف تالت | 28 |

تشغيلها محليًا:

```bash
npm run build && npm test
```

## 7. إضافة أو تعديل

| عايز | تعمل إيه |
| --- | --- |
| خدمة جديدة | عنصر جديد في `SERVICES` في `src/data/services.ts`. الصفحة والقوائم والـ sitemap والاختبارات بيتحدثوا لوحدهم |
| عمل جديد في أعمالنا | عنصر في `WORK` في `src/data/work.ts` + الصور في `public/work/<slug>/`. لو مشروع لعميل: `kind: "project"` وبعد موافقته |
| تغيير سعر | `src/config/pricing.ts` (الاختبارات بتتأكد إن صفحة الخدمة لسه متطابقة) |
| تغيير العرض أو تاريخه | `OFFER` في `src/config/site.ts` |
| تفعيل Google Ads أو Pixel | `TRACKING` في `src/config/site.ts`. الـ CSP بتسمح بمصادرهم أوتوماتيك |
| دومين خاص | `SITE_URL` في `astro.config.ts` + ملف `public/CNAME` + تحديث `robots.txt` |
