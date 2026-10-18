"""Shared helpers for the browser tools (tools/browser/, tools/ost/): serve the game, launch headless Chromium
through Playwright, open the game with its ?debug hooks and collect page errors.

Typical use (see tools/browser/screenshot.py for a complete example):

    with serve_game(A.get('url')) as url, sync_playwright() as p:
        browser = launch(p); page = new_page(browser)
        open_game(page, url); t(page, "testHooks.StartChapter('normal', 2)")
"""
import os, shutil, sys, tempfile, threading
from contextlib import contextmanager

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from serve import make_server  # noqa: E402


def args(argv=None):
    """Tiny argv parser: --key value, --flag (True), positional args in ['_']."""
    argv = sys.argv[1:] if argv is None else argv
    o, i = {'_': []}, 0
    while i < len(argv):
        a = argv[i]
        if a.startswith('--'):
            v = argv[i + 1] if i + 1 < len(argv) else None
            if v is None or v.startswith('--'): o[a[2:]] = True
            else: o[a[2:]] = v; i += 1
        else: o['_'].append(a)
        i += 1
    return o


@contextmanager
def serve_game(url=None, snapshot=False, source=None):
    """Yield the game's URL: `url` if given (e.g. the running dev server), else a private server on a free port.
    snapshot=True serves a copy of the game files taken now, so edits made during a long run don't leak into it.
    source: serve the game files of another folder (e.g. a saved copy of an older version) instead of the project."""
    if url:
        yield url; return
    root = source or ROOT
    if snapshot:
        root = tempfile.mkdtemp(prefix='aaa-sweeper-snapshot-')
        source = source or ROOT
        shutil.copy2(os.path.join(source, 'index.html'), root)
        for folder in ('css', 'js', 'assets'):
            shutil.copytree(os.path.join(source, folder), os.path.join(root, folder))
    srv = make_server('127.0.0.1', 0, quiet=True, root=root)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        yield f'http://127.0.0.1:{srv.server_address[1]}/'
    finally:
        srv.shutdown(); srv.server_close()
        if snapshot:
            shutil.rmtree(root, ignore_errors=True)


def launch(p):
    """Headless Chromium with autoplay allowed. Set CHROME_PATH to use another browser binary than Playwright's own."""
    flags = ['--autoplay-policy=no-user-gesture-required']
    if hasattr(os, 'getuid') and os.getuid() == 0: flags.append('--no-sandbox')  # Chromium refuses to sandbox as root
    return p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None, args=flags)


def new_page(browser, width=1440, height=900, mobile=False):
    """New page with a viewport preset; mobile=True emulates a 390x844 touch phone at DPR 2.
    Page errors (exceptions, console.error, HTTP >= 400) are collected in page.errors."""
    ctx = (browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True, accept_downloads=True)
           if mobile else browser.new_context(viewport={'width': width, 'height': height}, accept_downloads=True))
    page = ctx.new_page()
    page.errors = errs = []
    page.on('pageerror', lambda e: errs.append('PAGEERROR ' + (e.stack or e.message)))
    page.on('response', lambda r: r.status >= 400 and not r.url.endswith('favicon.ico') and errs.append(f'HTTP {r.status} {r.url}'))
    # 'Failed to load resource' is already reported with its URL by the response handler
    page.on('console', lambda m: m.type == 'error' and 'Failed to load resource' not in m.text and errs.append('console.error ' + m.text))
    return page


def open_game(page, url):
    """Load the game with debug hooks (window.testHooks, see js/debug.js) and wait until they are ready."""
    page.goto(url + ('&' if '?' in url else '?') + 'debug')
    page.wait_for_function('window.testHooksReady === true', timeout=20000)


def t(page, expr):
    """Evaluate a hook expression, e.g. t(page, "testHooks.StartChapter('normal', 2)"). Promises are not awaited."""
    return page.evaluate(f"(()=>{{const r=({expr});return (r&&typeof r.then==='function')?null:r;}})()")
