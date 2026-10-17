#!/usr/bin/env node
// Take a screenshot of any screen or game state in headless Chromium.
//
//   node tools/browser/screenshot.mjs --screen desktop
//   node tools/browser/screenshot.mjs --screen title
//   node tools/browser/screenshot.mjs --chapter 5 --clicks 6 --flood --breath -11.5
//   node tools/browser/screenshot.mjs --chapter 1 --boom --mobile --out out/blood-phone.png
//   node tools/browser/screenshot.mjs --screen credits --wait 20000
//
// Options
//   --screen desktop|title|credits   which screen (default: game when --chapter is given, else desktop)
//   --chapter N        start chapter N (1 Sector B-4, 2 Dune Sea, 3 Da Club, 4 Nord-7, 5 Pathos-4, 6 Mom's Backyard)
//   --diff story|normal|veteran      board size (default normal)
//   --clicks N         click N tiles first (the first click is the board centre, which is always safe)
//   --boom             step on a mine (blood overlay)
//   --flood            Pathos-4: run the flood timer out
//   --breath L         Pathos-4: set the breath readout to 10^L percent
//   --size WxH         viewport (default 1440x900); --mobile = 390x844 touch phone at DPR 2
//   --wait MS          extra wait before the shot (default 1500)
//   --target dev|single  dev server (default) or dist/triple-a-sweeper.html
//   --out FILE         output path (default out/shots/<name>.png)
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {args, startTarget, launch, newPage, openGame, t, sleep, ROOT} from '../lib/env.mjs';

const A = args();
const [w, h] = String(A.size || '1440x900').split('x').map(Number);
const screen = A.screen || (A.chapter ? 'game' : 'desktop');
const name = A.chapter ? `ch${A.chapter}${A.flood ? '-flood' : ''}${A.boom ? '-boom' : ''}` : screen;
const out = path.resolve(A.out || path.join(ROOT, 'out/shots', `${name}${A.mobile ? '-mobile' : ''}.png`));
mkdirSync(path.dirname(out), {recursive: true});

const srv = await startTarget(A.target || 'dev');
const browser = await launch();
const page = await newPage(browser, {width: w, height: h, mobile: !!A.mobile});
try {
  await openGame(page, srv.url);
  await t(page, '__t.audio()');
  if (screen === 'title') { await t(page, '__t.title()'); await sleep(2500); }
  if (screen === 'credits') { await t(page, '__t.credits()'); await sleep(2000); }
  if (screen === 'game') {
    await t(page, `__t.start('${A.diff || 'normal'}', ${+A.chapter || 1})`);
    await sleep(2400);
    const b = await t(page, '__t.board()');
    const n = +(A.clicks ?? 1);
    for (let k = 0; k < n; k++) {
      if (await t(page, '__t.G().dead || __t.G().over')) break;
      const x = b.x + b.w / 2 + (k ? (Math.random() - .5) * b.w * .6 : 0), y = b.y + b.h / 2 + (k ? (Math.random() - .5) * b.h * .6 : 0);
      await (A.mobile ? page.touchscreen.tap(x, y) : page.mouse.click(x, y)); await sleep(200);
    }
    if (A.boom) { await t(page, '(__t.G().hp = 100, __t.boom())'); await sleep(900); }
    if (A.flood) { await t(page, '__t.floodIn(1)'); await sleep(4000); }
    if (A.breath !== undefined) { await t(page, `__t.breath(${+A.breath})`); await sleep(300); }
    if (!A.mobile) await page.mouse.move(b.x + b.w * .3, b.y + b.h * .7);
  }
  await sleep(+(A.wait ?? 1500));
  await page.screenshot({path: out});
  console.log(path.relative(process.cwd(), out));
  if (page.errors.length) { console.log('page errors:'); page.errors.forEach(e => console.log('  ' + e)); process.exitCode = 1; }
} finally {
  await browser.close(); await srv.close();
}
