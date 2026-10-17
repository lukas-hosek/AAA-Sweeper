#!/usr/bin/env node
// Renders every music theme offline (OfflineAudioContext, faster than real time) with the game's own
// synthesis code and saves 24-bit / 48 kHz stereo WAVs to out/ost/wav/<theme>.wav.
// Each track repeats its full variation cycle until it is at least ~100 s long, then fades out over 10 s.
//
//   node tools/ost/render-ost.mjs              # all themes
//   node tools/ost/render-ost.mjs pathos club  # selected themes
// Then: python3 tools/ost/encode_ost.py  (loudness, MP3 + FLAC, tags, cover, zips)
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {args, startTarget, launch, newPage, openGame, ROOT} from '../lib/env.mjs';

// Steps per full variation cycle of each theme (see docs/MUSIC.md). STEP is seconds per step (from js/audio/music.js).
const CYCLE = {title: 32, game: 128, desert: 128, club: 128, arctic: 64, pathos: 128, home: 64, win: 32, credits: 192};
const MIN_SEC = 100, FADE_SEC = 10;

const A = args();
const themes = A._.length ? A._ : Object.keys(CYCLE);
const OUT = path.join(ROOT, 'out/ost/wav');
mkdirSync(OUT, {recursive: true});
const srv = await startTarget(A.target || 'dev');
const browser = await launch();
const page = await newPage(browser);
const info = {};
try {
  await openGame(page, srv.url);
  for (const m of themes) {
    if (!CYCLE[m]) throw new Error('unknown theme ' + m);
    const step = await page.evaluate(`__t.step('${m}')`);
    const cycleSec = CYCLE[m] * step, loops = Math.max(2, Math.ceil(MIN_SEC / cycleSec)), steps = CYCLE[m] * loops;
    const t0 = Date.now();
    const [dl] = await Promise.all([
      page.waitForEvent('download', {timeout: 600000}),
      page.evaluate(`window.__render('${m}', ${steps}, ${FADE_SEC}).then(r => (window.__last = r))`),
    ]);
    await dl.saveAs(path.join(OUT, m + '.wav'));
    const r = await page.evaluate('window.__last');
    info[m] = {...r, loops, cycleSec: +cycleSec.toFixed(2)};
    console.log(`${m.padEnd(8)} ${r.sec.toFixed(1)} s  (${loops} x ${cycleSec.toFixed(1)} s cycle, peak gain ${r.gainDb.toFixed(1)} dB)  rendered in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  writeFileSync(path.join(OUT, 'render-info.json'), JSON.stringify(info, null, 1));
  if (page.errors.length) { page.errors.forEach(e => console.log(e)); process.exitCode = 1; }
} finally {
  await browser.close(); await srv.close();
}
