/**
 * مؤثرات عامة للموقع كله:
 * - [data-reveal]: العنصر بيظهر بنعومة لما يدخل الشاشة (وولاده بالتتابع لو data-reveal="stagger").
 * - [data-tilt]: الكارت بيميل ثلاثي الأبعاد مع الماوس وفيه لمعة بتمشي ورا المؤشر.
 * - [data-count]: رقم بيعد من صفر لحد قيمته لما يظهر.
 * - [data-decode]: نص إنجليزي بيتفك كأنه شفرة.
 * كل ده بيتلغي لو المستخدم مفعّل "تقليل الحركة"، والمحتوى بيفضل ظاهر عادي من غير JS.
 */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

document.documentElement.classList.add("fx");

// ── الظهور مع السكرول ──
const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
if (reduced || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      if (el.dataset["reveal"] === "stagger") {
        [...el.children].forEach((c, i) => (c as HTMLElement).style.setProperty("--d", `${i * 90}ms`));
      }
      el.classList.add("in");
      io.unobserve(el);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
}

// ── ميل ثلاثي الأبعاد + لمعة ──
if (finePointer && !reduced) {
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });
}

// ── عدّاد الأرقام ──
const fmt = new Intl.NumberFormat("en-US");
document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
  const to = Number(el.dataset["count"]);
  if (!Number.isFinite(to) || reduced) return;
  const suffix = el.dataset["suffix"] ?? "";
  el.textContent = `0${suffix}`;
  new IntersectionObserver(([e], obs) => {
    if (!e?.isIntersecting) return;
    obs.disconnect();
    const t0 = performance.now(), dur = 1400;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = `${fmt.format(v)}${suffix}`;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 }).observe(el);
});

// ── نص بيتفك كأنه شفرة ──
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]#$%&*+=";
document.querySelectorAll<HTMLElement>("[data-decode]").forEach((el) => {
  const final = el.textContent ?? "";
  if (reduced) return;
  let frame = 0;
  const total = 28;
  const run = () => {
    frame++;
    el.textContent = [...final].map((ch, i) => (ch === " " || ch === "·" || frame / total > i / final.length ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
    if (frame < total + 4) requestAnimationFrame(run); else el.textContent = final;
  };
  new IntersectionObserver(([e], obs) => { if (e?.isIntersecting) { obs.disconnect(); run(); } }).observe(el);
});

export {};
