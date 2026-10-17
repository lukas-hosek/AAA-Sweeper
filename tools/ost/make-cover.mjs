#!/usr/bin/env node
// Album cover for the soundtrack: the title screen, square, with "Original Game Soundtrack" instead of
// "Press any key" and without the news ticker. Writes out/ost/cover.jpg (1000 x 1000).
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {startTarget, launch, newPage, openGame, t, sleep, ROOT} from '../lib/env.mjs';

const out = path.join(ROOT, 'out/ost/cover.jpg');
mkdirSync(path.dirname(out), {recursive: true});
const srv = await startTarget('dev');
const browser = await launch();
const page = await newPage(browser, {width: 1000, height: 1000});
try {
  await openGame(page, srv.url);
  await t(page, '__t.title()');
  await sleep(3500);
  await page.evaluate(() => {
    document.querySelectorAll('.ticker,.ti-build').forEach(e => (e.style.display = 'none'));
    const p = document.querySelector('#press'); p.textContent = 'ORIGINAL GAME SOUNDTRACK'; p.style.animation = 'none'; p.style.opacity = '.85';
  });
  await sleep(300);
  await page.screenshot({path: out, type: 'jpeg', quality: 92});
  console.log(path.relative(process.cwd(), out));
} finally {
  await browser.close(); await srv.close();
}
