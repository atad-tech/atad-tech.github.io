/**
 * حماية من الـ Clickjacking.
 * GitHub Pages مش بيسمح بهيدر X-Frame-Options ولا frame-ancestors (ما بيشتغلش من <meta>)،
 * فلو حد حط الموقع جوه iframe على موقع تاني، بنخفي الصفحة ونفتحها في نافذتها هي.
 */
if (window.top !== window.self) {
  document.documentElement.style.visibility = "hidden";
  try {
    window.top!.location.href = window.self.location.href;
  } catch {
    // لو المتصفح منع التنقل من جوه الـ iframe، الصفحة بتفضل مخفية ومحدش يقدر يضغط عليها
  }
}

export {};
