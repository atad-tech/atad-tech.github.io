"""
بيعمل public/atad-profile.pdf من صفحة /profile/ بعد البناء.
التشغيل: npm run build && npx astro preview --ignore-lock --port 4399 & python3 scripts/make-profile-pdf.py
"""
import sys
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4399/profile/"
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/atad-profile.pdf"

HIDE = """
.promo, .hdr, .wa-float, footer, .crumbs, .scroll,
a[download], .btn-row a[data-wa], .tabs { display: none !important; }
.card, .cap, .timeline li, .phone, .stats li, .term, .galaxy { break-inside: avoid; }
.intro { min-height: 1050px !important; }
/* background-clip: text بيطلع بإطار في الـ PDF، فبنخلي النص لون ثابت */
.intro h1 span, .head h2 span, .stats b { background: none !important; color: #7dd3fc !important; -webkit-text-fill-color: #7dd3fc !important; }
"""

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1240, "height": 1754}, bypass_csp=True, reduced_motion="reduce", device_scale_factor=1)
    ctx.route("**/*", lambda r: r.continue_() if r.request.url.startswith(("http://127.0.0.1", "data:", "blob:")) else r.abort())
    pg = ctx.new_page()
    pg.emulate_media(media="screen", reduced_motion="reduce")
    pg.goto(URL, wait_until="networkidle")
    pg.add_style_tag(content=HIDE)
    pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')")
    pg.wait_for_timeout(1500)
    pg.pdf(path=OUT, width="1240px", height="1754px", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    b.close()
print("wrote", OUT)
