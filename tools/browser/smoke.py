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

with serve_game(A.get('url'), snapshot=True) as url, sync_playwright() as p:
    browser = launch(p)
    page = new_page(browser, mobile=MOBILE)
    shot = lambda name: page.screenshot(path=os.path.join(OUT, name + '.png'))
    tap = page.touchscreen.tap if MOBILE else page.mouse.click
    wait = page.wait_for_timeout
    status = lambda: t(page, 'testHooks.FieldStatus()')
    try:
        print(f'smoke test · {tag} · {url}', flush=True)
        open_game(page, url)
        wait(500)
        check(t(page, 'testHooks.CurrentScreen()') == 'desktop', 'boots to the Win98 desktop')
        shot('00-desktop')

        if A.get('full'):
            page.get_by_role('button', name='Triple A Sweeper').first.click()
            page.wait_for_function("testHooks.CurrentScreen() === 'intro'", timeout=15000)
            check(True, 'launcher finished, intro started')
            wait(3000); shot('01-intro')
            page.wait_for_function("testHooks.CurrentScreen() === 'title'", timeout=25000)
            check(True, 'intro finished, title screen shown')
        else:
            t(page, 'testHooks.InitAudio()')
            t(page, 'testHooks.PlayIntro()')
            wait(1500)
            page.keyboard.down('Space'); wait(1200); page.keyboard.up('Space')
            page.wait_for_function("testHooks.CurrentScreen() === 'title'", timeout=5000)
            check(True, 'holding Space skips the intro')
        wait(1500)
        check(t(page, 'testHooks.CurrentMusicTheme()') == 'title', 'title music playing')
        shot('02-title')

        for c in t(page, 'testHooks.Chapters()'):
            n, scenery = c['number'], c['scenery']
            t(page, f"testHooks.StartChapter('normal', {n})")
            wait(2400)
            g = status()
            music, layout = t(page, 'testHooks.CurrentMusicTheme()'), t(page, 'testHooks.BoardRect().layout')
            check(g['chapterName'] == c['name'] and music == c['musicTheme'] and g['tilesetName'] == c['tilesetName'],
                  f"chapter {n} {c['name']}: tileset {g['tilesetName']}, music {music}, layout {layout}")
            b = t(page, 'testHooks.BoardRect()')
            cx, cy = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
            tap(cx, cy); wait(400)
            for _ in range(6):
                g = status()
                if g['isDead'] or g['isOver']: break
                tap(cx + (random.random() - .5) * b['width'] * .6, cy + (random.random() - .5) * b['height'] * .6); wait(180)
            check(status()['openedCount'] > 0, f'chapter {n}: tiles revealed by clicking')
            wait(2500)
            shot(f'1{n}-{scenery}')
            if n == 1:
                nv = t(page, 'testHooks.DecodedVoiceCount()')
                check(nv >= 5, f'voice lines load and decode ({nv} cached)')
                t(page, '(testHooks.SetHitPoints(100), testHooks.StepOnMine())'); wait(1300)
                check(status()['mineHits'] > 0, 'stepping on a mine damages the player')
                shot(f'1{n}-{scenery}-blood')
            if scenery == 'pathos':
                t(page, 'testHooks.FloodIn(1)'); wait(4500)
                check(status()['isFlooded'], 'Pathos-4 floods when the timer runs out')
                t(page, 'testHooks.SetBreath(-11.47)'); wait(600)
                o2 = ' '.join(page.locator('#oxygen-readout').inner_text().split())
                check('BREATH' in o2, 'breath readout shows: ' + o2)
                shot(f'1{n}-{scenery}-flooded')

        # Systems around the board, on a fresh chapter 1
        t(page, "testHooks.StartChapter('normal', 1)")
        wait(2400)
        if not MOBILE:
            page.keyboard.press('ArrowRight'); page.keyboard.press('x'); wait(200)
            check(status()['flagCount'] == 1, 'keyboard: X flags the tile under the cursor')
            page.keyboard.press('x'); page.keyboard.press('Space'); wait(400)
            check(status()['flagCount'] == 0 and status()['openedCount'] > 0, 'keyboard: X unflags, Space reveals')
        else:
            b = t(page, 'testHooks.BoardRect()')
            tap(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2); wait(400)

        t(page, 'testHooks.OpenPauseMenu()'); wait(300)
        check(status()['isPaused'] and t(page, 'testHooks.VisibleOverlays()') == ['pause'], 'pause menu pauses the game')
        shot('30-pause')
        t(page, 'testHooks.ResumeGame()'); wait(300)
        check(not status()['isPaused'] and t(page, 'testHooks.VisibleOverlays()') == [], 'resume unpauses')

        for tab in ['quests', 'skills', 'store', 'achievements', 'settings']:
            t(page, f"testHooks.OpenPanel('{tab}')"); wait(300)
            check(t(page, 'testHooks.VisibleOverlays()') == ['panel'], f'panel tab {tab} opens')
            shot(f'31-panel-{tab}')
            if tab == 'store':
                coins = t(page, 'testHooks.ProfileStatus().coins')
                t(page, "testHooks.BuyStoreItem('coins')"); wait(200)
                t(page, "testHooks.BuyStoreItem('gold')"); wait(200)
                profile = t(page, 'testHooks.ProfileStatus()')
                check(profile['coins'] == coins + 1000 - 300 and profile['equippedSkin'] == 'gold',
                      f"store: coin bundle and golden flag bought ({coins} → {profile['coins']} coins)")
            t(page, 'testHooks.ClosePanel()'); wait(300)
        check(not status()['isPaused'], 'closing the panel resumes the game')

        t(page, '(testHooks.SetHitPoints(1), testHooks.StepOnMine())'); wait(1500)
        check(status()['isDead'] and t(page, 'testHooks.VisibleOverlays()') == ['death'], 'dying shows the death screen')
        shot('32-death')
        page.wait_for_function('!testHooks.FieldStatus().isDead', timeout=12000)
        check(status()['hitPoints'] == 100 and t(page, 'testHooks.VisibleOverlays()') == [], 'checkpoint restores the player')

        t(page, 'testHooks.RevealAllSafeTiles()'); wait(500)
        check(status()['isWon'], 'revealing every safe tile wins the chapter')
        page.wait_for_function("testHooks.VisibleOverlays().includes('results')", timeout=12000)
        check(True, 'results screen shown')
        shot('33-results')

        t(page, 'testHooks.RollCredits()')
        wait(4000); shot('20-credits-cards')
        page.wait_for_function('testHooks.CreditsStatus().positionCount > 0', timeout=40000)
        wait(5000)
        cr = t(page, 'testHooks.CreditsStatus()')
        check(cr['isRolling'] and cr['positionCount'] == 1412, f"credits rolling: {cr['positionCount']} positions credited (expected 1,412)")
        check(t(page, 'testHooks.CurrentMusicTheme()') == 'credits', 'credits music playing')
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
