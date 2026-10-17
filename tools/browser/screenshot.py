#!/usr/bin/env python3
"""Take a screenshot of any screen or game state in headless Chromium.

    .venv/bin/python tools/browser/screenshot.py --screen desktop
    .venv/bin/python tools/browser/screenshot.py --screen title
    .venv/bin/python tools/browser/screenshot.py --chapter 5 --clicks 6 --flood --breath -11.5
    .venv/bin/python tools/browser/screenshot.py --chapter 1 --boom --mobile --out out/blood-phone.png
    .venv/bin/python tools/browser/screenshot.py --screen credits --wait 20000

Options
  --screen desktop|title|credits   which screen (default: game when --chapter is given, else desktop)
  --chapter N        start chapter N (1 Sector B-4, 2 Dune Sea, 3 Da Club, 4 Nord-7, 5 Pathos-4, 6 Mom's Backyard)
  --diff story|normal|veteran      board size (default normal)
  --clicks N         click N tiles first (the first click is the board centre, which is always safe)
  --boom             step on a mine (blood overlay)
  --flood            Pathos-4: run the flood timer out
  --breath L         Pathos-4: set the breath readout to 10^L percent
  --size WxH         viewport (default 1440x900); --mobile = 390x844 touch phone at DPR 2
  --wait MS          extra wait before the shot (default 1500)
  --url URL          use a running server (e.g. http://localhost:8080/) instead of a private one
  --out FILE         output path (default out/shots/<name>.png)
"""
import os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from env import ROOT, args, serve_game, launch, new_page, open_game, t  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

A = args()
w, h = map(int, str(A.get('size', '1440x900')).split('x'))
mobile = bool(A.get('mobile'))
screen = A.get('screen') or ('game' if A.get('chapter') else 'desktop')
name = f"ch{A['chapter']}{'-flood' if A.get('flood') else ''}{'-boom' if A.get('boom') else ''}" if A.get('chapter') else screen
out = os.path.abspath(A.get('out') or os.path.join(ROOT, 'out', 'shots', f"{name}{'-mobile' if mobile else ''}.png"))
os.makedirs(os.path.dirname(out), exist_ok=True)

with serve_game(A.get('url')) as url, sync_playwright() as p:
    browser = launch(p)
    page = new_page(browser, width=w, height=h, mobile=mobile)
    wait = page.wait_for_timeout
    try:
        open_game(page, url)
        t(page, '__t.audio()')
        if screen == 'title': t(page, '__t.title()'); wait(2500)
        if screen == 'credits': t(page, '__t.credits()'); wait(2000)
        if screen == 'game':
            t(page, f"__t.start('{A.get('diff', 'normal')}', {int(A.get('chapter', 1))})")
            wait(2400)
            b = t(page, '__t.board()')
            for k in range(int(A.get('clicks', 1))):
                if t(page, '__t.G().dead || __t.G().over'): break
                x = b['x'] + b['w'] / 2 + ((random.random() - .5) * b['w'] * .6 if k else 0)
                y = b['y'] + b['h'] / 2 + ((random.random() - .5) * b['h'] * .6 if k else 0)
                (page.touchscreen.tap if mobile else page.mouse.click)(x, y); wait(200)
            if A.get('boom'): t(page, '(__t.G().hp = 100, __t.boom())'); wait(900)
            if A.get('flood'): t(page, '__t.floodIn(1)'); wait(4000)
            if 'breath' in A: t(page, f"__t.breath({float(A['breath'])})"); wait(300)
            if not mobile: page.mouse.move(b['x'] + b['w'] * .3, b['y'] + b['h'] * .7)
        wait(int(A.get('wait', 1500)))
        page.screenshot(path=out)
        print(os.path.relpath(out))
        if page.errors:
            print('page errors:')
            for e in page.errors: print('  ' + e)
    finally:
        browser.close()
sys.exit(1 if page.errors else 0)
