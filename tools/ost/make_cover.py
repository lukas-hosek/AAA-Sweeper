#!/usr/bin/env python3
"""Album cover for the soundtrack: the title screen, square, with "Original Game Soundtrack" instead of
"Press any key" and without the news ticker. Writes out/ost/cover.jpg (1000 x 1000).

    .venv/bin/python tools/ost/make_cover.py
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from env import ROOT, args, serve_game, launch, new_page, open_game, t  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

out = os.path.join(ROOT, 'out', 'ost', 'cover.jpg')
os.makedirs(os.path.dirname(out), exist_ok=True)

with serve_game(args().get('url')) as url, sync_playwright() as p:
    browser = launch(p)
    page = new_page(browser, width=1000, height=1000)
    try:
        open_game(page, url)
        t(page, '__t.title()')
        page.wait_for_timeout(3500)
        page.evaluate("""() => {
          document.querySelectorAll('.ticker,.ti-build').forEach(e => (e.style.display = 'none'));
          const p = document.querySelector('#press'); p.textContent = 'ORIGINAL GAME SOUNDTRACK'; p.style.animation = 'none'; p.style.opacity = '.85';
        }""")
        page.wait_for_timeout(300)
        page.screenshot(path=out, type='jpeg', quality=92)
        print(os.path.relpath(out))
    finally:
        browser.close()
