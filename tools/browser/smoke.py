#!/usr/bin/env python3
"""Smoke test: plays through every screen and chapter in headless Chromium and fails on any JS error.

    scripts/smoke.sh                                   # desktop viewport (runs this file with the venv's Python)
    scripts/smoke.sh --mobile                          # phone viewport (390x844, touch)
    scripts/smoke.sh --full                            # also click the desktop icon and sit through launcher + intro
    scripts/smoke.sh --url http://localhost:8080/      # test an already running server instead of a private one

Screenshots go to out/smoke/<viewport>/*.png. Exit code 1 if anything failed.
"""
import os, random, sys, traceback
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from env import ROOT, args, serve_game, launch, new_page, open_game, t  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

A = args()
MOBILE = bool(A.get('mobile'))
tag = 'mobile' if MOBILE else 'desktop'
OUT = os.path.join(ROOT, 'out', 'smoke', tag)
os.makedirs(OUT, exist_ok=True)

failures = []
def check(ok, msg):
    print(('  ok   ' if ok else '  FAIL ') + msg, flush=True)
    if not ok: failures.append(msg)

with serve_game(A.get('url')) as url, sync_playwright() as p:
    browser = launch(p)
    page = new_page(browser, mobile=MOBILE)
    shot = lambda name: page.screenshot(path=os.path.join(OUT, name + '.png'))
    tap = page.touchscreen.tap if MOBILE else page.mouse.click
    wait = page.wait_for_timeout
    try:
        print(f'smoke test · {tag} · {url}', flush=True)
        open_game(page, url)
        wait(500)
        check(t(page, '__t.screen()') == 'desktop', 'boots to the Win98 desktop')
        shot('00-desktop')

        if A.get('full'):
            page.click('#aaa-icon')
            page.wait_for_function("__t.screen() === 'intro'", timeout=15000)
            check(True, 'launcher finished, intro started')
            wait(3000); shot('01-intro')
            page.wait_for_function("__t.screen() === 'title'", timeout=25000)
            check(True, 'intro finished, title screen shown')
        else:
            t(page, '__t.audio()')
            t(page, '__t.title()')
            page.wait_for_function("__t.screen() === 'title'", timeout=5000)
        wait(1500)
        check(t(page, '__t.mus()') == 'title', 'title music playing')
        shot('02-title')

        for c in t(page, '__t.chapters()'):
            n, bg = c['n'], c['bg']
            t(page, f"__t.start('normal', {n})")
            wait(2400)
            g = t(page, '({name:__t.G().theme.name, ts:__t.G().tileset, mus:__t.mus(), layout:__t.board().layout})')
            check(g['name'] == c['name'] and g['mus'] == c['mus'] and g['ts'] == c['ts'],
                  f"chapter {n} {c['name']}: tileset {g['ts']}, music {g['mus']}, layout {g['layout']}")
            b = t(page, '__t.board()')
            cx, cy = b['x'] + b['w'] / 2, b['y'] + b['h'] / 2
            tap(cx, cy); wait(400)
            for _ in range(6):
                if t(page, '__t.G().dead || __t.G().over'): break
                tap(cx + (random.random() - .5) * b['w'] * .6, cy + (random.random() - .5) * b['h'] * .6); wait(180)
            check(t(page, '__t.G().opened') > 0, f'chapter {n}: tiles revealed by clicking')
            wait(2500)
            shot(f'1{n}-{bg}')
            if n == 1:
                nv = t(page, '__t.voicesLoaded()')
                check(nv >= 5, f'voice lines load and decode ({nv} cached)')
                t(page, '(__t.G().hp = 100, __t.boom())'); wait(1300)
                check(t(page, '__t.G().booms') > 0, 'stepping on a mine damages the player')
                shot(f'1{n}-{bg}-blood')
            if bg == 'pathos':
                t(page, '__t.floodIn(1)'); wait(4500)
                check(t(page, '__t.G().flooded'), 'Pathos-4 floods when the timer runs out')
                t(page, '__t.breath(-11.47)'); wait(600)
                o2 = ' '.join(page.locator('#o2').inner_text().split())
                check('BREATH' in o2, 'breath readout shows: ' + o2)
                shot(f'1{n}-{bg}-flooded')

        t(page, '__t.credits()')
        wait(4000); shot('20-credits-cards')
        page.wait_for_function('__t.cr().n > 0', timeout=40000)
        wait(5000)
        cr = t(page, '__t.cr()')
        check(cr['on'] and cr['n'] == 1412, f"credits rolling: {cr['n']} positions credited (expected 1,412)")
        check(t(page, '__t.mus()') == 'credits', 'credits music playing')
        shot('21-credits-roll')
    except Exception as e:
        failures.append(f'EXCEPTION {e}')
        traceback.print_exc()
    finally:
        if page.errors:
            print('page errors:')
            for e in page.errors: print('  ' + e)
        browser.close()

bad = len(failures) + len(page.errors)
print(f'\nFAILED: {len(failures)} checks, {len(page.errors)} page errors' if bad else f'\nall good · screenshots in {os.path.relpath(OUT, ROOT)}')
sys.exit(1 if bad else 0)
