#!/usr/bin/env node
// Single-file build: bundles js/ with esbuild, inlines every CSS file and every voice MP3 (base64)
// into ONE html file that runs from file:// or any static host, like the original artifact.
//
//   node tools/build/build-single.mjs              -> dist/triple-a-sweeper.html      (complete HTML document)
//   node tools/build/build-single.mjs --artifact   -> dist/triple-a-sweeper.artifact.html
//        (fragment without <!doctype>/<head>, <title> on the first line: the format claude.ai Artifacts expect)
//   add --minify to minify the JavaScript.
//
// Fonts: the dev build self-hosts them (css/fonts.css); the single file links Google Fonts instead
// (tools/build/google-fonts.html) to stay small.
import {build} from 'esbuild';
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const ARTIFACT = argv.includes('--artifact'), MINIFY = argv.includes('--minify');
const rd = p => readFileSync(path.join(ROOT, p), 'utf8');

// 1) JavaScript bundle (ES modules -> one IIFE; the ?debug dynamic import is bundled in lazily)
const res = await build({
  entryPoints: [path.join(ROOT, 'js/main.js')], bundle: true, format: 'iife', target: 'es2020',
  write: false, minify: MINIFY, legalComments: 'none', charset: 'utf8', logLevel: 'warning',
});
const bundle = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// 2) CSS: concatenate the stylesheets in the order index.html links them (fonts.css excluded)
let html = rd('index.html');
const cssLinks = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">\n?/g)].filter(m => !m[1].endsWith('fonts.css'));
const css = cssLinks.map(m => `/* ${m[1]} */\n` + rd(m[1])).join('\n');

// 3) voices: inline every MP3 as base64 (voice-bank.js prefers window.__VOICE_B64 over fetching)
const manifestSrc = rd('js/data/voice-manifest.js');
const ids = [...manifestSrc.matchAll(/^"([^"]+)":/gm)].map(m => m[1]);
const voices = {};
for (const id of ids) {
  const f = path.join(ROOT, 'public/voices', id + '.mp3');
  if (!existsSync(f)) throw new Error('missing voice file ' + f);
  voices[id] = readFileSync(f).toString('base64');
}
const voiceScript = `<script>window.__VOICE_B64=${JSON.stringify(voices)};</script>`;

// 4) assemble
const fonts = rd('tools/build/google-fonts.html').trim();
const favicon = 'data:image/svg+xml;base64,' + Buffer.from(rd('public/favicon.svg')).toString('base64');
const bodyMarkup = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script type="module"')).trim();
const script = `${voiceScript}\n<script>\n${bundle}</script>`;
let out;
if (ARTIFACT) {
  out = `<title>Triple A Sweeper</title>\n${fonts}\n<style>\n${css}</style>\n${bodyMarkup}\n${script}\n`;
} else {
  out = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n` +
    `<title>Triple A Sweeper</title>\n<link rel="icon" href="${favicon}">\n${fonts}\n<style>\n${css}</style>\n</head>\n<body>\n${bodyMarkup}\n${script}\n</body>\n</html>\n`;
}
mkdirSync(path.join(ROOT, 'dist'), {recursive: true});
const file = path.join(ROOT, 'dist', ARTIFACT ? 'triple-a-sweeper.artifact.html' : 'triple-a-sweeper.html');
writeFileSync(file, out);
console.log(`${path.relative(ROOT, file)}  ${(out.length / 1e6).toFixed(2)} MB  (${ids.length} voices, JS ${(bundle.length / 1e3).toFixed(0)} kB, CSS ${(css.length / 1e3).toFixed(0)} kB)`);
