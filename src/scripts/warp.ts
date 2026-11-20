/**
 * نفق نجوم (warp) لأي <canvas data-warp>: نجوم جاية ناحيتك من العمق،
 * وكل ما تعمل سكرول أسرع، السرعة بتزيد والنجوم بتتحول لخطوط نور.
 * بيقف خارج الشاشة، وبيرسم فريم ثابت لو "تقليل الحركة" مفعّل.
 */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

interface P { x: number; y: number; z: number; pz: number; hue: number }

function start(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let w = 0, h = 0, cx = 0, cy = 0, dpr = 1;
  let pts: P[] = [];
  let speed = 2, target = 2, running = false, raf = 0;
  let lastY = scrollY, mx = 0, my = 0, tmx = 0, tmy = 0;
  const DEPTH = 1000;

  const spawn = (p: P, far = true) => {
    p.x = (Math.random() - 0.5) * w * 2.2;
    p.y = (Math.random() - 0.5) * h * 2.2;
    p.z = far ? DEPTH : Math.random() * DEPTH;
    p.pz = p.z;
    p.hue = Math.random() < 0.18 ? 265 : 192;
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    cx = w / 2; cy = h / 2;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(w < 700 ? 260 : 520, Math.round((w * h) / 2600));
    pts = Array.from({ length: n }, () => { const p = { x: 0, y: 0, z: 0, pz: 0, hue: 192 }; spawn(p, false); return p; });
  };

  const frame = () => {
    // أثر خفيف بدل المسح الكامل: بيعمل ذيل للنجوم
    ctx.fillStyle = reduced ? "rgba(3,9,20,1)" : "rgba(3,9,20,0.32)";
    ctx.fillRect(0, 0, w, h);
    speed += (target - speed) * 0.06;
    target += (2 - target) * 0.04;
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    const ox = cx + mx * 60, oy = cy + my * 40;
    const f = Math.min(w, h) * 0.9;

    for (const p of pts) {
      p.pz = reduced ? p.z + 70 : p.z; // في الوضع الثابت بنرسم ذيل ثابت عشان النجوم تبان
      if (!reduced) p.z -= speed * 4;
      if (p.z < 1) { spawn(p); continue; }
      const sx = ox + (p.x / p.z) * f, sy = oy + (p.y / p.z) * f;
      const px = ox + (p.x / p.pz) * f, py = oy + (p.y / p.pz) * f;
      if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) { spawn(p); continue; }
      const k = 1 - p.z / DEPTH;
      ctx.strokeStyle = `hsla(${p.hue}, 95%, ${60 + k * 30}%, ${Math.min(1, k * 1.4)})`;
      ctx.lineWidth = Math.max(0.5, k * 2.4);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
    }
  };

  const loop = () => { frame(); if (running) raf = requestAnimationFrame(loop); };
  const play = () => { if (running || reduced) return; running = true; raf = requestAnimationFrame(loop); };
  const pause = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  if (reduced) {
    for (let i = 0; i < 1; i++) frame();
    new ResizeObserver(() => { resize(); frame(); }).observe(canvas);
    return;
  }
  new ResizeObserver(resize).observe(canvas);
  let visible = false;
  new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; if (visible && !document.hidden) play(); else pause(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); else if (visible) play(); });
  addEventListener("scroll", () => { const d = Math.abs(scrollY - lastY); lastY = scrollY; target = Math.min(28, target + d * 0.08); }, { passive: true });
  const host = canvas.closest<HTMLElement>(".dark") ?? document.body;
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });
  host.addEventListener("pointerdown", () => { target = 30; }, { passive: true });
}

document.querySelectorAll<HTMLCanvasElement>("canvas[data-warp]").forEach(start);

export {};
