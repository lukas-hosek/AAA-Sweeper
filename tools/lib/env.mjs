// Shared helpers for the browser-based tools: start the game (dev server or single-file build),
// launch headless Chromium through Playwright, and collect page errors.
import {chromium} from 'playwright';
import {createServer, preview} from 'vite';
import {existsSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SINGLE = path.join(ROOT, 'dist/triple-a-sweeper.html');

/** Tiny argv parser: --key value, --flag, positional args in _ */
export function args(argv = process.argv.slice(2)) {
  const o = {_: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2), v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; }
    } else o._.push(a);
  }
  return o;
}

/**
 * Start a target and return {url, close}.
 *  - 'dev'    : Vite dev server on a free port (default; serves the source files directly)
 *  - 'single' : dist/triple-a-sweeper.html over file:// (run `npm run build` first)
 *  - 'site'   : the multi-file Vite build in dist/site, served by `vite preview` (run `npm run build:site` first)
 */
export async function startTarget(target = 'dev') {
  if (target === 'single') {
    if (!existsSync(SINGLE)) throw new Error('dist/triple-a-sweeper.html not found. Run `npm run build` first.');
    return {url: pathToFileURL(SINGLE).href, close: async () => {}};
  }
  if (target === 'site') {
    if (!existsSync(path.join(ROOT, 'dist/site/index.html'))) throw new Error('dist/site not found. Run `npm run build:site` first.');
    const pv = await preview({root: ROOT, logLevel: 'error', preview: {port: 0, host: '127.0.0.1'}});
    return {url: pv.resolvedUrls.local[0], close: () => new Promise(r => pv.httpServer.close(() => r()))};
  }
  const server = await createServer({root: ROOT, logLevel: 'error', server: {port: 0, host: '127.0.0.1'}});
  await server.listen();
  const url = server.resolvedUrls.local[0];
  return {url, close: () => server.close()};
}

/** Launch headless Chromium. Set CHROME_PATH to use a specific browser binary instead of Playwright's own. */
export async function launch() {
  const flags = ['--autoplay-policy=no-user-gesture-required'];
  if (process.getuid && process.getuid() === 0) flags.push('--no-sandbox'); // Chromium refuses to sandbox as root
  return chromium.launch({executablePath: process.env.CHROME_PATH || undefined, args: flags});
}

/** New page with a viewport preset. mobile=true emulates a 390x844 touch phone at DPR 2. */
export async function newPage(browser, {width = 1440, height = 900, mobile = false} = {}) {
  const ctx = await browser.newContext(mobile
    ? {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, hasTouch: true, isMobile: true, acceptDownloads: true}
    : {viewport: {width, height}, acceptDownloads: true});
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push('PAGEERROR ' + (e.stack || e.message)));
  page.on('response', r => { if (r.status() >= 400 && !/favicon\.ico$/.test(r.url())) page.errors.push(`HTTP ${r.status()} ${r.url()}`); });
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/fonts\.(googleapis|gstatic)\.com|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/.test(t)) return; // offline font fetches
    if (/Failed to load resource/.test(t)) return; // reported with its URL by the response handler above
    page.errors.push('console.error ' + t);
  });
  return page;
}

/** Open the game with debug hooks (window.__t) and wait until they are ready. */
export async function openGame(page, url) {
  const u = url + (url.includes('?') ? '&' : '?') + 'debug';
  await page.goto(u);
  await page.waitForFunction(() => window.__debugReady === true, null, {timeout: 20000});
}

/** Run an expression with the debug hooks, e.g. t(page, "__t.start('normal', 2)"). Promises are not awaited. */
export const t = (page, expr) => page.evaluate(`(()=>{const r=(${expr});return (r&&typeof r.then==='function')?null:r;})()`);

export const sleep = ms => new Promise(r => setTimeout(r, ms));
