#!/usr/bin/env python3
"""Unit tests of the game's pure modules (the Minesweeper rules), run in headless Chromium.

    scripts/unit_tests.sh

Every tools/browser/unit/*.test.js module exports TESTS = {name: function (check) {...}}. The tests import game
modules by absolute path (/js/...). The test files themselves are served through Playwright routing, so the game
server still serves only index.html, css/, js/ and assets/. Exit code 1 if any test fails.
"""
import glob, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from env import serve_game, launch, new_page  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

UNIT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'unit')

RUNNER = '''<!doctype html><meta charset="utf-8"><script type="module">
const files = %s;
const results = [];
for (const file of files) {
    const module = await import('./' + file);
    for (const [name, test] of Object.entries(module.TESTS)) {
        const failures = [];
        let checks = 0;
        const check = (condition, message) => { checks++; if (!condition && failures.length < 5) failures.push(message); };
        try { test(check); } catch (error) { failures.push('EXCEPTION ' + (error.stack || error)); }
        results.push({file, name, checks, failures});
    }
}
window.unitTestResults = results;
</script>'''


def main():
    files = sorted(os.path.basename(f) for f in glob.glob(os.path.join(UNIT_DIR, '*.test.js')))
    with serve_game(snapshot=True) as url, sync_playwright() as p:
        browser = launch(p)
        page = new_page(browser)

        def serve_unit_file(route):
            name = route.request.url.split('/__unit__/', 1)[1].split('?')[0]
            if name == 'runner.html':
                route.fulfill(content_type='text/html', body=RUNNER % json.dumps(files))
            else:
                route.fulfill(content_type='text/javascript', body=open(os.path.join(UNIT_DIR, name), encoding='utf-8').read())

        page.route('**/__unit__/**', serve_unit_file)
        page.goto(url + '__unit__/runner.html')
        page.wait_for_function('window.unitTestResults !== undefined', timeout=120000)
        results = page.evaluate('window.unitTestResults')
        errors = page.errors
        browser.close()

    failed = 0
    for result in results:
        ok = not result['failures']
        failed += not ok
        print(f"  {'ok  ' if ok else 'FAIL'} {result['file']}: {result['name']} ({result['checks']} checks)")
        for failure in result['failures']:
            print('       ' + failure)
    for error in errors:
        print('  page error: ' + error)
    print(f'\n{len(results) - failed}/{len(results)} tests passed' + ('' if failed or errors else ' · all good'))
    return 1 if failed or errors else 0


if __name__ == '__main__':
    sys.exit(main())
