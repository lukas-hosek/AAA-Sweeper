#!/usr/bin/env python3
"""Renders every music theme offline (OfflineAudioContext, faster than real time) with the game's own
synthesis code and saves 24-bit / 48 kHz stereo WAVs to out/ost/wav/<theme>.wav.
Each track repeats its full variation cycle until it is at least ~100 s long, then fades out over 10 s.

    .venv/bin/python tools/ost/render_ost.py              # all themes
    .venv/bin/python tools/ost/render_ost.py pathos club  # selected themes

Then: tools/ost/encode_ost.py (loudness, MP3 + FLAC, tags, cover, zips). scripts/export_ost.sh runs all steps.
"""
import json, math, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from env import ROOT, args, serve_game, launch, new_page, open_game  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

# Steps per full variation cycle of each theme (see docs/MUSIC.md). Seconds per step come from STEP in js/audio/music.js.
CYCLE = {'title': 32, 'game': 128, 'desert': 128, 'club': 128, 'arctic': 64, 'pathos': 128, 'home': 64, 'win': 32, 'credits': 192}
MIN_SEC, FADE_SEC = 100, 10

A = args()
themes = A['_'] or list(CYCLE)
for m in themes:
    if m not in CYCLE: sys.exit(f'unknown theme {m} (known: {", ".join(CYCLE)})')
OUT = os.path.join(ROOT, 'out', 'ost', 'wav')
os.makedirs(OUT, exist_ok=True)
info = {}

with serve_game(A.get('url')) as url, sync_playwright() as p:
    browser = launch(p)
    page = new_page(browser)
    try:
        open_game(page, url)
        for m in themes:
            step = page.evaluate(f"__t.step('{m}')")
            cycle_sec = CYCLE[m] * step
            loops = max(2, math.ceil(MIN_SEC / cycle_sec))
            t0 = time.time()
            with page.expect_download(timeout=600000) as dl:
                r = page.evaluate(f"window.__render('{m}', {CYCLE[m] * loops}, {FADE_SEC})")
            dl.value.save_as(os.path.join(OUT, m + '.wav'))
            info[m] = {**r, 'loops': loops, 'cycleSec': round(cycle_sec, 2)}
            print(f"{m:8s} {r['sec']:.1f} s  ({loops} x {cycle_sec:.1f} s cycle, peak gain {r['gainDb']:.1f} dB)  rendered in {time.time() - t0:.1f} s", flush=True)
        with open(os.path.join(OUT, 'render-info.json'), 'w') as f:
            json.dump(info, f, indent=1)
        for e in page.errors: print(e)
    finally:
        browser.close()
sys.exit(1 if page.errors else 0)
