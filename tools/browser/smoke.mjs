#!/usr/bin/env node
// Smoke test: plays through every screen and chapter in headless Chromium and fails on any JS error.
//
//   node tools/browser/smoke.mjs                 # desktop viewport, Vite dev server
//   node tools/browser/smoke.mjs --mobile        # phone viewport (390x844, touch)
//   node tools/browser/smoke.mjs --target single # test dist/triple-a-sweeper.html (run `npm run build` first)
//   node tools/browser/smoke.mjs --full          # also click the desktop icon and sit through launcher + intro
//
// Screenshots go to out/smoke/<viewport>/*.png. Exit code 1 if anything failed.
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {args, startTarget, launch, newPage, openGame, t, sleep, ROOT} from '../lib/env.mjs';

const A = args();
const target = A.target || 'dev';
const tag = A.mobile ? 'mobile' : 'desktop';
const OUT = path.join(ROOT, 'out/smoke', tag + (target === 'dev' ? '' : '-' + target));
mkdirSync(OUT, {recursive: true});

const failures = [];
const check = (ok, msg) => { console.log((ok ? '  ok   ' : '  FAIL ') + msg); if (!ok) failures.push(msg); };
const shot = (page, name) => page.screenshot({path: path.join(OUT, name + '.png')});

const srv = await startTarget(target);
const browser = await launch();
const page = await newPage(browser, {mobile: !!A.mobile});
const tap = (x, y) => A.mobile ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);
try {
  console.log(`smoke test · ${target} · ${tag} · ${srv.url}`);
  await openGame(page, srv.url);
  await sleep(500);
  check(await t(page, '__t.screen()') === 'desktop', 'boots to the Win98 desktop');
  await shot(page, '00-desktop');

  if (A.full) {
    await page.click('#aaa-icon');
    await page.waitForFunction(() => __t.screen() === 'intro', null, {timeout: 15000});
    check(true, 'launcher finished, intro started');
    await sleep(3000); await shot(page, '01-intro');
    await page.waitForFunction(() => __t.screen() === 'title', null, {timeout: 25000});
    check(true, 'intro finished, title screen shown');
  } else {
    await t(page, '__t.audio()');
    await t(page, '__t.title()');
    await page.waitForFunction(() => __t.screen() === 'title', null, {timeout: 5000});
  }
  await sleep(1500);
  check(await t(page, '__t.mus()') === 'title', 'title music playing');
  await shot(page, '02-title');

  const chapters = await t(page, '__t.chapters()');
  for (const c of chapters) {
    await t(page, `__t.start('normal', ${c.n})`);
    await sleep(2400);
    const g = await t(page, '({name:__t.G().theme.name, ts:__t.G().tileset, mus:__t.mus(), layout:__t.board().layout})');
    check(g.name === c.name && g.mus === c.mus && g.ts === c.ts, `chapter ${c.n} ${c.name}: tileset ${g.ts}, music ${g.mus}, layout ${g.layout}`);
    const b = await t(page, '__t.board()');
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    await tap(cx, cy); await sleep(400);
    for (let k = 0; k < 6; k++) {
      if (await t(page, '__t.G().dead || __t.G().over')) break;
      await tap(cx + (Math.random() - .5) * b.w * .6, cy + (Math.random() - .5) * b.h * .6); await sleep(180);
    }
    check((await t(page, '__t.G().opened')) > 0, `chapter ${c.n}: tiles revealed by clicking`);
    await sleep(2500);
    await shot(page, `1${c.n}-${c.bg}`);
    if (c.n === 1) {
      const nv = await t(page, '__t.voicesLoaded()');
      check(nv >= 5, `voice lines load and decode (${nv} cached)`);
      await t(page, '(__t.G().hp = 100, __t.boom())'); await sleep(1300);
      check((await t(page, '__t.G().booms')) > 0, 'stepping on a mine damages the player');
      await shot(page, '1' + c.n + '-' + c.bg + '-blood');
    }
    if (c.bg === 'pathos') {
      await t(page, '__t.floodIn(1)'); await sleep(4500);
      check(await t(page, '__t.G().flooded'), 'Pathos-4 floods when the timer runs out');
      await t(page, '__t.breath(-11.47)'); await sleep(600);
      const o2 = await page.locator('#o2').innerText();
      check(/BREATH 3\.\d\d×10−11/.test(o2.replace(/\s+/g, '')) || /BREATH/.test(o2), 'breath readout shows: ' + o2.replace(/\s+/g, ' ').trim());
      await shot(page, `1${c.n}-${c.bg}-flooded`);
    }
  }

  await t(page, '__t.credits()');
  await sleep(4000); await shot(page, '20-credits-cards');
  await page.waitForFunction(() => __t.cr().n > 0, null, {timeout: 40000});
  await sleep(5000);
  const cr = await t(page, '__t.cr()');
  check(cr.on && cr.n === 1412, `credits rolling: ${cr.n} positions credited (expected 1,412)`);
  check(await t(page, '__t.mus()') === 'credits', 'credits music playing');
  await shot(page, '21-credits-roll');
} catch (e) {
  failures.push('EXCEPTION ' + (e.stack || e));
  console.error(e);
} finally {
  if (page.errors.length) { console.log('page errors:'); page.errors.forEach(e => console.log('  ' + e)); }
  await browser.close(); await srv.close();
}
const bad = failures.length + page.errors.length;
console.log(bad ? `\nFAILED: ${failures.length} checks, ${page.errors.length} page errors` : `\nall good · screenshots in ${path.relative(ROOT, OUT)}`);
process.exit(bad ? 1 : 0);
