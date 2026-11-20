/**
 * خلفية فضاء متحركة لأي <canvas data-space>:
 * نجوم على 3 طبقات بعمق مختلف، شبكة بتوصل النجوم القريبة (إحساس بيانات وتقنية)،
 * شهب بتعدي كل كام ثانية، وحركة بسيطة مع الماوس.
 *
 * - بتقف لوحدها لما الكانفاس يخرج من الشاشة أو التاب يتقفل (توفير بطارية).
 * - لو المستخدم مفعّل "تقليل الحركة" بترسم فريم ثابت بس.
 * - الكثافة بتقل على الموبايل.
 */

interface Star { x: number; y: number; z: number; r: number; tw: number; sp: number }
interface Meteor { x: number; y: number; vx: number; vy: number; life: number }

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function start(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dense = canvas.dataset["space"] === "dense";
  let w = 0, h = 0, dpr = 1;
  let stars: Star[] = [];
  const meteors: Meteor[] = [];
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let running = false, raf = 0, last = 0, nextMeteor = 1500;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = w < 700;
    const count = Math.round(((w * h) / (mobile ? 5200 : 3200)) * (dense ? 1.4 : 1));
    stars = Array.from({ length: Math.min(count, 420) }, () => {
      const z = Math.random();
      return { x: Math.random() * w, y: Math.random() * h, z, r: 0.35 + z * 1.35, tw: Math.random() * Math.PI * 2, sp: 0.4 + Math.random() * 1.2 };
    });
  };

  const draw = (t: number, dt: number) => {
    ctx.clearRect(0, 0, w, h);
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;

    // الشبكة: خطوط خفيفة بين النجوم القريبة في الطبقة الأمامية
    const front = stars.filter((s) => s.z > 0.55);
    const maxD = w < 700 ? 80 : 110;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < front.length; i++) {
      const a = front[i]!;
      const ax = a.x + mx * a.z * 18, ay = a.y + my * a.z * 18;
      for (let j = i + 1; j < front.length; j++) {
        const b = front[j]!;
        const bx = b.x + mx * b.z * 18, by = b.y + my * b.z * 18;
        const dx = ax - bx, dy = ay - by, d = Math.hypot(dx, dy);
        if (d < maxD) {
          ctx.strokeStyle = `rgba(18,194,233,${(1 - d / maxD) * 0.22})`;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        }
      }
    }

    // النجوم
    for (const s of stars) {
      if (!reduced) {
        s.y -= s.z * s.sp * dt * 0.006; // طالعة لفوق ببطء كأننا ماشيين في الفضاء
        if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
      }
      const x = s.x + mx * s.z * 18, y = s.y + my * s.z * 18;
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw + t * 0.0016 * s.sp)) * s.z;
      ctx.fillStyle = s.z > 0.85 ? `rgba(160,236,255,${a})` : `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
      if (s.z > 0.93) {
        ctx.fillStyle = `rgba(18,194,233,${a * 0.18})`;
        ctx.beginPath(); ctx.arc(x, y, s.r * 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // الشهب
    if (!reduced) {
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        nextMeteor = 2600 + Math.random() * 4200;
        const fromRight = Math.random() > 0.5;
        meteors.push({ x: fromRight ? w * (0.5 + Math.random() * 0.5) : w * Math.random() * 0.5, y: -10, vx: (fromRight ? -1 : 1) * (0.35 + Math.random() * 0.25), vy: 0.32 + Math.random() * 0.18, life: 1 });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]!;
        m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt / 1800;
        if (m.life <= 0 || m.y > h + 40) { meteors.splice(i, 1); continue; }
        const tail = 90;
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
        g.addColorStop(0.3, `rgba(18,194,233,${0.5 * m.life})`);
        g.addColorStop(1, "rgba(18,194,233,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail); ctx.stroke();
      }
    }
  };

  const loop = (t: number) => {
    const dt = Math.min(48, last ? t - last : 16);
    last = t;
    draw(t, dt);
    if (running) raf = requestAnimationFrame(loop);
  };
  const play = () => { if (running || reduced) return; running = true; last = 0; raf = requestAnimationFrame(loop); };
  const pause = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  draw(0, 0);
  if (reduced) {
    new ResizeObserver(() => { resize(); draw(0, 0); }).observe(canvas);
    return;
  }
  new ResizeObserver(resize).observe(canvas);

  let visible = false;
  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    if (visible && !document.hidden) play(); else pause();
  }).observe(canvas);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); else if (visible) play(); });

  const host = canvas.closest<HTMLElement>(".dark") ?? document.body;
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });
  host.addEventListener("pointerleave", () => { tmx = 0; tmy = 0; });
}

document.querySelectorAll<HTMLCanvasElement>("canvas[data-space]").forEach(start);

export {};
