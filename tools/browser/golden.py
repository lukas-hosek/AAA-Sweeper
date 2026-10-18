#!/usr/bin/env python3
"""Golden comparison: plays fixed scenarios with a seeded Math.random and a fake clock, so every run produces
bit-identical screenshots and audio fingerprints. Record a baseline before a refactor, compare after it.

    scripts/golden.sh record                      # play every scenario, store the results as the baseline
    scripts/golden.sh compare                     # play again and compare with the baseline
    scripts/golden.sh compare --only title,ch3    # selected scenarios (comma-separated)
    scripts/golden.sh compare --coverage          # also list game functions that never ran
    scripts/golden.sh list                        # scenario names
    scripts/golden.sh record --only x --source DIR   # record from another copy of the game (index.html, css/, js/, assets/)

Output: out/golden/baseline/ (record), out/golden/current/ and out/golden/diff/ (compare).
A difference in a screenshot writes a diff image (changed pixels in red) to out/golden/diff/.

How it stays deterministic:
- Math.random is replaced by a seeded generator before any game code runs, and reseeded at the start of each
  scenario, so changes in how many random numbers the boot sequence draws don't shift the scenarios.
- Playwright's fake clock drives Date, timers, requestAnimationFrame and performance.now. Time only advances
  through run(ms), in 16 ms animation frames.
- Screenshots are taken with CSS animations finished, the film grain (pure noise) is hidden, every web font
  is loaded up front, and live audio is disabled (music and sound effects are checked through offline renders).
"""
import base64, datetime, json, os, shutil, sys, traceback
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from env import ROOT, args, serve_game, launch  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = os.path.join(ROOT, 'out', 'golden')
START_TIME = datetime.datetime(2026, 1, 1, 12, 0, 0)
PAUSE_TIME = datetime.datetime(2026, 1, 1, 12, 1, 0)

# Screenshots may differ in a few anti-aliased pixels between runs (compositor raster); such tiny differences
# are reported as warnings. Anything larger fails.
NEAR_PIXELS, NEAR_CHANNEL_DELTA = 32, 16

# Offline audio is compared by its 20 ms RMS envelope: reverb tails are not bit-identical between runs
ENVELOPE_TOLERANCE = 1e-4

# Steps per full variation cycle of each music theme (same as tools/ost/render_ost.py)
MUSIC_CYCLES = {'title': 32, 'game': 128, 'desert': 128, 'club': 128, 'arctic': 64, 'pathos': 128, 'home': 64, 'win': 32, 'credits': 192}

# Sound effects by their name in js/debug.js
SOUND_EFFECTS = ['ui', 'hover', 'reveal-1', 'reveal-12', 'flag', 'unflag', 'denied', 'boom', 'heart', 'level', 'achievement', 'coin',
                 'whoosh', 'quest', 'lore', 'respects', 'tune', 'ding', 'countdown-tick', 'bubble', 'flood', 'crate', 'sting-engine',
                 'sting-physics', 'sting-blink', 'sting-ice', 'sting-megalith']

SEEDED_RANDOM = '''(() => {
    let state = 12345;
    Math.random = () => {
        state = state + 0x6D2B79F5 | 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    window.goldenReseed = seed => { state = seed | 0; };
    // Live audio runs on real time (voice decoding, analyser data), so golden runs stay silent.
    // Music and sound effects are checked through offline renders instead.
    window.AudioContext = undefined;
    window.webkitAudioContext = undefined;
})();'''

# The film grain is regenerated noise; hiding it keeps the screenshots about the game itself
HIDE_NOISE_CSS = '#fx-grain, #film-grain { display: none !important; }'


class Session:
    """One scenario in its own browser context: fresh storage, seeded randomness, paused clock."""

    def __init__(self, browser, url, out_dir, viewport, coverage):
        self.out_dir, self.captures, self.audio = out_dir, [], {}
        if viewport == 'mobile':
            self.context = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True,
                                               is_mobile=True, timezone_id='UTC', locale='en-US')
        else:
            w, h = viewport
            self.context = browser.new_context(viewport={'width': w, 'height': h}, timezone_id='UTC', locale='en-US')
        self.mobile = viewport == 'mobile'
        self.context.add_init_script(SEEDED_RANDOM)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda e: self.errors.append('PAGEERROR ' + (e.stack or e.message)))
        self.page.on('console', lambda m: m.type == 'error' and self.errors.append('console.error ' + m.text))
        self.cdp = None
        if coverage:
            self.cdp = self.context.new_cdp_session(self.page)
            self.cdp.send('Profiler.enable')
            self.cdp.send('Profiler.startPreciseCoverage', {'callCount': True, 'detailed': False})
        self.page.clock.install(time=START_TIME)
        self.page.goto(url + '?debug')
        self.page.wait_for_function('window.testHooksReady === true', timeout=20000)
        # Canvas text uses fonts that may not be loaded yet, so load every face before anything is drawn
        self.page.evaluate('Promise.all([...document.fonts].map(face => face.load())).then(() => true)')
        self.page.add_style_tag(content=HIDE_NOISE_CSS)
        self.page.clock.pause_at(PAUSE_TIME)

    def hook(self, expression):
        """Evaluates a testHooks expression (promises are awaited)."""
        return self.page.evaluate(expression)

    def reseed(self, seed):
        self.page.evaluate(f'goldenReseed({seed})')

    def run(self, ms):
        """Advances the fake clock, firing timers and 16 ms animation frames."""
        self.page.clock.run_for(ms)

    def capture(self, label):
        name = f'{len(self.captures):02d}-{label}.png'
        self.page.screenshot(path=os.path.join(self.out_dir, name), animations='disabled')
        self.captures.append(name)

    def tap(self, x, y):
        (self.page.touchscreen.tap if self.mobile else self.page.mouse.click)(x, y)

    def board_centre(self):
        rect = self.hook('testHooks.BoardRect()')
        return rect['x'] + rect['width'] / 2, rect['y'] + rect['height'] / 2

    def take_coverage(self):
        return self.cdp.send('Profiler.takePreciseCoverage')['result'] if self.cdp else []

    def close(self):
        self.context.close()


# ---------------------------------------------------------------------------------------------- scenarios

def scenario_desktop(s):
    s.capture('desktop')
    s.page.get_by_role('button', name='Start', exact=True).click(); s.run(300)
    s.capture('start-menu')
    s.page.mouse.click(700, 420); s.run(200)
    s.page.get_by_role('button', name='PATCH_NOTES.TXT').dblclick(); s.run(300)
    s.capture('patch-notes')
    s.page.get_by_role('button', name='My Computer').dblclick(); s.run(300)
    s.capture('message-box')


def scenario_launch(s):
    s.page.get_by_role('button', name='Launch Triple A Sweeper').click()
    elapsed = 0
    for at in [1200, 4000, 6800, 9500, 12500, 15500, 18000, 21000, 24500]:
        s.run(at - elapsed)
        elapsed = at
        s.capture(f'{at}ms')


def scenario_title(s):
    s.hook('testHooks.ShowTitle()'); s.run(2500)
    s.capture('press-any-key')
    s.page.keyboard.press('Enter'); s.run(500)
    s.capture('main-menu')
    s.hook("testHooks.ClickButton('NEW GAME')"); s.run(300)
    s.capture('difficulty')
    s.hook("testHooks.ClickButton('NORMAL')"); s.run(300)
    s.capture('chapter-select')
    s.hook("testHooks.ClickButton('1. ')"); s.run(1300)
    s.capture('loading')
    s.run(6000)
    s.capture('chapter-from-menu')


def play_chapter(s, chapter, difficulty='normal'):
    """Starts a chapter, clicks the centre, reveals a few tiles, chords, flags, hovers and moves the keyboard cursor."""
    s.hook(f"testHooks.StartChapter('{difficulty}', {chapter})"); s.run(2600)
    s.capture('start')
    s.tap(*s.board_centre()); s.run(1200)
    s.capture('first-reveal')
    safe = s.hook('testHooks.HiddenSafeTiles()')
    for tile in [safe[0], safe[len(safe) // 2], safe[-1]] if safe else []:
        s.hook(f'testHooks.RevealTile({tile})')
    candidate = s.hook('testHooks.FindChordCandidate()')
    if candidate:
        for mine in candidate['minesToFlag']:
            s.hook(f'testHooks.FlagTile({mine})')
        s.hook(f"testHooks.RevealTile({candidate['numberTile']})")
    safe = s.hook('testHooks.HiddenSafeTiles()')
    if safe and not s.mobile:
        centre = s.hook(f'testHooks.TileCenter({safe[0]})')
        s.page.mouse.move(centre['x'], centre['y'])
    if not s.mobile:
        s.page.keyboard.press('ArrowRight')
    s.run(1500)
    s.capture('played')


def make_chapter_scenario(chapter):
    def scenario(s):
        play_chapter(s, chapter)
        if chapter == 1:
            s.hook('(testHooks.SetHitPoints(100), testHooks.StepOnMine())'); s.run(250)
            s.capture('mine-hit')
            s.run(1500)
            s.capture('blood')
        if chapter == 5:
            s.hook('testHooks.FloodIn(1)'); s.run(4500)
            s.capture('flooded')
            s.hook('testHooks.SetBreath(-11.47)'); s.run(600)
            s.capture('breath')
    return scenario


def scenario_new_game_plus(s):
    s.hook("testHooks.StartChapter('story', 7)"); s.run(2600)
    s.capture('start')


def scenario_systems(s):
    s.hook("testHooks.StartChapter('normal', 1)"); s.run(2600)
    s.tap(*s.board_centre()); s.run(500)
    s.hook('testHooks.SpawnSupplyDrop()'); s.run(3000)
    s.capture('supply-drop')
    s.hook('testHooks.StartClubNight()'); s.run(2000)
    s.capture('club-night')
    s.hook('testHooks.OpenPauseMenu()'); s.run(300)
    s.capture('pause')
    for tab in ['quests', 'skills', 'store', 'achievements', 'settings']:
        s.hook(f"testHooks.OpenPanel('{tab}')"); s.run(300)
        s.capture(f'panel-{tab}')
        if tab == 'store':
            s.hook("testHooks.BuyStoreItem('coins')"); s.run(100)
            s.hook("testHooks.BuyStoreItem('gold')"); s.run(300)
            s.capture('store-bought')
    s.hook('testHooks.ClosePanel()'); s.run(300)
    s.hook('(testHooks.SetHitPoints(1), testHooks.StepOnMine())'); s.run(1500)
    s.capture('death')
    s.run(7500)
    s.capture('checkpoint')
    s.hook('testHooks.RevealAllSafeTiles()'); s.run(1200)
    s.capture('victory')
    s.run(6000)
    s.capture('results')


def scenario_extras(s):
    """Side quests, opening a supply crate, paying respects, the club leaving, a settings change, menus and quitting."""
    s.hook("testHooks.StartChapter('normal', 1)"); s.run(2600)
    s.tap(*s.board_centre()); s.run(500)
    s.hook("testHooks.GiveSideQuest('kova')"); s.run(2000)
    s.capture('side-quest')
    s.hook("testHooks.GiveSideQuest('qm')"); s.run(3000)
    s.hook("testHooks.OpenPanel('quests')"); s.run(300)
    s.capture('quest-log-side-quests')
    s.hook('testHooks.ClosePanel()'); s.run(300)
    s.hook('testHooks.SpawnSupplyDrop()'); s.run(3000)
    s.hook('testHooks.RevealTile(testHooks.SupplyCrateTile())'); s.run(600)
    s.capture('crate-opened')
    s.page.keyboard.press('f'); s.run(400)
    s.capture('respects')
    s.hook('testHooks.StartClubNight()'); s.run(26000)
    s.capture('club-ended')
    s.hook("testHooks.OpenPanel('settings')"); s.run(300)
    s.hook("testHooks.ChangeChatterSetting('constant')"); s.run(300)
    s.capture('settings-changed')
    s.hook('testHooks.ClosePanel()'); s.run(300)
    s.hook('testHooks.OpenPauseMenu()'); s.run(300)
    s.hook("testHooks.ClickButton('QUIT TO MAIN MENU')"); s.run(2500)
    s.capture('title-from-game')
    s.page.keyboard.press('ArrowDown'); s.page.keyboard.press('ArrowDown'); s.run(300)
    s.capture('menu-navigation')
    s.hook("testHooks.ClickButton('QUIT TO DESKTOP')"); s.run(1500)
    s.capture('quit-to-desktop')


def scenario_intro_skip(s):
    s.hook('testHooks.PlayIntro()'); s.run(1500)
    s.page.keyboard.down('Space'); s.run(1200); s.page.keyboard.up('Space'); s.run(2500)
    s.capture('title-after-skip')


def scenario_credits_skip(s):
    s.hook('testHooks.RollCredits()'); s.run(6000)
    s.page.keyboard.press('Escape'); s.run(8000)
    s.capture('after-skip')


def scenario_layout_mid(s):
    play_chapter(s, 1)


def scenario_layout_narrow(s):
    play_chapter(s, 1)
    s.hook("testHooks.StartChapter('normal', 5)"); s.run(2600)
    s.capture('pathos')


def scenario_veteran(s):
    play_chapter(s, 4, 'veteran')


def scenario_credits(s):
    s.hook('testHooks.RollCredits()'); s.run(4000)
    s.capture('cards')
    for _ in range(60):
        if s.hook('testHooks.CreditsStatus().positionCount') > 0: break
        s.run(1000)
    s.run(5000)
    s.capture('roll')
    s.run(20000)
    s.capture('roll-later')


def scenario_audio(s):
    for i, (theme, steps) in enumerate(MUSIC_CYCLES.items()):
        s.reseed(1000 + i)
        s.audio[f'music-{theme}'] = s.hook(f"musicExporter.Fingerprint('{theme}', {steps})")
    # Each effect gets its own seed, so adding or removing one doesn't shift the noise of the others
    for i, name in enumerate(SOUND_EFFECTS):
        s.reseed(2000 + i)
        s.audio[f'sfx-{name}'] = s.hook(f"testHooks.SoundEffectFingerprint('{name}')")


SCENARIOS = [
    ('desktop', scenario_desktop, (1440, 900)),
    ('launch', scenario_launch, (1440, 900)),
    ('title', scenario_title, (1440, 900)),
    *[(f'ch{n}', make_chapter_scenario(n), (1440, 900)) for n in range(1, 7)],
    ('new-game-plus', scenario_new_game_plus, (1440, 900)),
    ('systems', scenario_systems, (1440, 900)),
    ('extras', scenario_extras, (1440, 900)),
    ('intro-skip', scenario_intro_skip, (1440, 900)),
    ('credits-skip', scenario_credits_skip, (1440, 900)),
    ('layout-mid', scenario_layout_mid, (1000, 760)),
    ('layout-narrow', scenario_layout_narrow, 'mobile'),
    ('veteran', scenario_veteran, (1920, 1080)),
    ('credits', scenario_credits, (1440, 900)),
    ('audio', scenario_audio, (1440, 900)),
]


# ---------------------------------------------------------------------------------------------- comparison

DIFF_SCRIPT = '''async ([a, b]) => {
    const load = src => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
    const [imageA, imageB] = await Promise.all([load(a), load(b)]);
    if (imageA.width !== imageB.width || imageA.height !== imageB.height) return {changed: -1, maxDelta: 255, png: null};
    const w = imageA.width, h = imageA.height;
    const pixels = img => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h); };
    const pa = pixels(imageA), pb = pixels(imageB);
    const out = document.createElement('canvas'); out.width = w; out.height = h; const g = out.getContext('2d'); const od = g.createImageData(w, h);
    let changed = 0, maxDelta = 0;
    for (let i = 0; i < pa.data.length; i += 4) {
        const same = pa.data[i] === pb.data[i] && pa.data[i + 1] === pb.data[i + 1] && pa.data[i + 2] === pb.data[i + 2];
        for (let k = 0; k < 3; k++) maxDelta = Math.max(maxDelta, Math.abs(pa.data[i + k] - pb.data[i + k]));
        const grey = (pa.data[i] + pa.data[i + 1] + pa.data[i + 2]) / 9;
        od.data[i] = same ? grey : 255; od.data[i + 1] = same ? grey : 0; od.data[i + 2] = same ? grey : 0; od.data[i + 3] = 255;
        if (!same) changed++;
    }
    g.putImageData(od, 0, 0);
    return {changed, maxDelta, png: out.toDataURL('image/png')};
}'''


def compare_images(page, path_a, path_b, diff_path):
    """Returns (changed pixels or -1 if the sizes differ, largest channel difference) and writes a diff image."""
    as_url = lambda p: 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
    result = page.evaluate(DIFF_SCRIPT, [as_url(path_a), as_url(path_b)])
    if result['png']:
        os.makedirs(os.path.dirname(diff_path), exist_ok=True)
        with open(diff_path, 'wb') as f:
            f.write(base64.b64decode(result['png'].split(',', 1)[1]))
    return result['changed'], result['maxDelta']


def coverage_report(entries):
    """Lists game functions (js/) that never ran in any scenario, as file:line name."""
    counts = {}
    for script in entries:
        url = script['url']
        if '/js/' not in url or url.endswith('/debug.js'):
            continue
        rel = 'js/' + url.split('/js/', 1)[1].split('?')[0]
        for fn in script['functions']:
            start = fn['ranges'][0]['startOffset']
            key = (rel, start, fn['functionName'])
            counts[key] = counts.get(key, 0) + fn['ranges'][0]['count']
    never = sorted(k for k, c in counts.items() if c == 0)
    sources = {}
    print(f'\ncoverage: {len(never)} of {len(counts)} functions never ran')
    for rel, start, name in never:
        if rel not in sources:
            sources[rel] = open(os.path.join(ROOT, rel), encoding='utf-8').read().encode('utf-16-le')
        line = sources[rel][:start * 2].decode('utf-16-le').count('\n') + 1
        print(f'  {rel}:{line}  {name or "(anonymous)"}')


def main():
    a = args()
    mode = a['_'][0] if a['_'] else 'compare'
    if mode == 'list':
        print('\n'.join(name for name, _, _ in SCENARIOS)); return 0
    if mode not in ('record', 'compare'):
        sys.exit('usage: golden.py record|compare|list [--only a,b] [--coverage]')
    only = set(a['only'].split(',')) if a.get('only') else None
    selected = [sc for sc in SCENARIOS if not only or sc[0] in only]
    if only and len(selected) != len(only):
        sys.exit(f'unknown scenario in --only (known: {", ".join(n for n, _, _ in SCENARIOS)})')
    base_dir = os.path.join(OUT, 'baseline')
    run_dir = base_dir if mode == 'record' else os.path.join(OUT, 'current')
    diff_dir = os.path.join(OUT, 'diff')
    if mode == 'compare' and not os.path.isdir(base_dir):
        sys.exit('no baseline: run scripts/golden.sh record first')
    if mode == 'compare' and os.path.isdir(diff_dir):
        shutil.rmtree(diff_dir)

    problems, warnings, coverage = [], [], []
    # A snapshot of the game files, so the code can be edited while a long comparison runs
    with serve_game(a.get('url'), snapshot=True, source=a.get('source')) as url, sync_playwright() as p:
        browser = launch(p)
        diff_page = browser.new_page()
        for name, play, viewport in selected:
            out_dir = os.path.join(run_dir, name)
            if os.path.isdir(out_dir):
                shutil.rmtree(out_dir)
            os.makedirs(out_dir)
            session = None
            try:
                session = Session(browser, url, out_dir, viewport, a.get('coverage'))
                session.reseed(4242)
                play(session)
                if session.audio:
                    with open(os.path.join(out_dir, 'audio.json'), 'w') as f:
                        json.dump(session.audio, f, indent=1, sort_keys=True)
                coverage += session.take_coverage()
                problems += [f'{name}: {e}' for e in session.errors]
            except Exception as e:
                traceback.print_exc()
                problems.append(f'{name}: EXCEPTION {e}')
            finally:
                if session:
                    session.close()

            if mode == 'record':
                print(f'{name:14s} recorded {len(os.listdir(out_dir))} files', flush=True)
                continue
            base = os.path.join(base_dir, name)
            names = sorted(set(os.listdir(out_dir)) | set(os.listdir(base) if os.path.isdir(base) else []))
            same = 0
            for file in names:
                a_path, b_path = os.path.join(base, file), os.path.join(out_dir, file)
                if not os.path.exists(a_path) or not os.path.exists(b_path):
                    problems.append(f'{name}/{file}: only in {"current" if os.path.exists(b_path) else "baseline"}')
                elif open(a_path, 'rb').read() == open(b_path, 'rb').read():
                    same += 1
                elif file.endswith('.png'):
                    changed, delta = compare_images(diff_page, a_path, b_path, os.path.join(diff_dir, name, file))
                    message = f'{name}/{file}: ' + ('size differs' if changed < 0 else f'{changed} pixels differ (max channel delta {delta})')
                    if 0 <= changed <= NEAR_PIXELS and delta <= NEAR_CHANNEL_DELTA:
                        warnings.append(message)
                        same += 1
                    else:
                        problems.append(message)
                else:
                    old, new = json.load(open(a_path)), json.load(open(b_path))
                    near = 0
                    for key in sorted(set(old) | set(new)):
                        a_env, b_env = (old.get(key) or {}).get('envelope'), (new.get(key) or {}).get('envelope')
                        if a_env is None or b_env is None or len(a_env) != len(b_env):
                            problems.append(f'{name}/{file}: {key} missing or of different length')
                            continue
                        deviation = max((abs(x - y) for x, y in zip(a_env, b_env)), default=0)
                        if deviation > ENVELOPE_TOLERANCE:
                            problems.append(f'{name}/{file}: {key} envelope differs by up to {deviation:.6f}')
                        elif old[key]['fingerprint'] != new[key]['fingerprint']:
                            near += 1
                    if near:
                        warnings.append(f'{name}/{file}: {near} renders within tolerance but not bit-identical (reverb)')
                    same += not any(p.startswith(f'{name}/{file}') for p in problems)
            print(f'{name:14s} {same}/{len(names)} match', flush=True)
        browser.close()

    if a.get('coverage'):
        coverage_report(coverage)
    if warnings:
        print(f'\n{len(warnings)} near-identical (within tolerance):')
        for warning in warnings:
            print('  ' + warning)
    if problems:
        print(f'\n{len(problems)} problems:')
        for problem in problems:
            print('  ' + problem)
        if mode == 'compare' and os.path.isdir(diff_dir):
            print(f'diff images in {os.path.relpath(diff_dir, ROOT)}')
        return 1
    print('\nall match' if mode == 'compare' else f'\nbaseline recorded in {os.path.relpath(base_dir, ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
