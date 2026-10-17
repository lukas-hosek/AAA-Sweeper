# Music playback system

The soundtrack has no audio files. It is about 12 KB of JavaScript (`js/audio/instruments.js` and `js/audio/music.js`) that composes and synthesises nine themes live. Each theme is a short loop: four or eight bars of chords and melody data, with variation layered on top by longer phrase counters.

## 1. The scheduler

```js
const MUS = {mode:'none', step:0, next:0, timer:null};
musicStart(mode)  // switch theme: step = 0, next = now + 80 ms; starts a 40 ms setInterval once
musicStop()       // mode = 'none'
musicTick()       // every 40 ms: schedule every step whose time falls in the next 300 ms
musicStep(mode, s, t)  // play step s of a theme at AudioContext time t
```

This is the standard "two clocks" look-ahead pattern:
- **Imprecise timer, exact notes:** a coarse JavaScript timer wakes up often. Every note is scheduled at an exact time on the audio hardware clock (`AudioContext.currentTime`), so timing stays sample-accurate even when the main thread stutters.
- **Catching up:** if the tab falls behind by more than 50 ms, `next` jumps forward instead of firing a burst of late notes.
- **Safety cap:** at most 48 steps are scheduled per tick.
- **Background tabs:** the browser throttles timers there; the game pauses anyway.

**No crossfades.** Switching themes is immediate on the next step. Notes already scheduled, plus reverb tails, ring out naturally, which sounds like a cut in a film score.

**Who switches the theme:**

| Situation | Theme |
|---|---|
| Title screen (`toTitle`) | `title` |
| Starting a chapter (`fieldMusic()` → `FIELDS[i].mus`) | `game`, `desert`, `club`, `arctic`, `pathos`, `home` |
| The club arrives in another chapter | `club` for 24 s, then back to the chapter's theme |
| Field cleared | `win` |
| Credits | `credits` |
| Quit to desktop | Stops |

## 2. Data formats

```js
STEP[mode]   // seconds per sequencer step = 60 / BPM / subdivision
PROG[mode]   // chord per bar: [MIDI root, quality], quality 'M' | 'm' | 'maj7' | 'm7' | '7'
triad(root, q)          // -> [root, third, fifth]
CH7[q]                  // seventh-chord intervals for 'maj7' | 'm7' | '7'
n2f(midi)               // MIDI note -> Hz (A4 = 69 = 440 Hz)
```

Melodies are arrays of MIDI notes per bar, one entry per step, with `0` meaning a rest:

```js
const PMEL = [[77,0,0,76,72,0,0,0], [74,0,71,0,74,76,0,0], [76,0,72,0,69,0,0,71], [74,0,0,0,0,0,0,0]]; // Pathos-4 flute
const HIJAZ = [...16-step bars...];  // Dune Sea oud line in D Hijaz (D Eb F# G A Bb C)
const ARCPAT = [[0,-1,2,-1,...], [...]]; // Nord-7 bells: indices into the current triad, -1 = rest, >= 3 = an octave up
```

Inside `musicStep` each theme derives its position from the step counter `s`: `bar = floor(s/8) % 4`, `st = s % 8`, and longer counters such as `floor(s/32)` (phrase) or `floor(s/64)` (cycle). It then decides what to play on this step.

## 3. The themes

| Theme | Where | Tempo / step | Harmony | Full variation cycle |
|---|---|---|---|---|
| `title` | Title screen | 72 BPM, 8ths (0.417 s) | Dm – B♭ – F – C | 32 steps, 13.3 s |
| `game` | Sector B-4 | 100 BPM, 16ths (0.15 s) | Dm – Dm – B♭ – C | 128 steps, 19.2 s |
| `desert` | The Dune Sea | 92 BPM, 16ths (0.163 s) | D + A drone, D Hijaz melody | 128 steps, 20.9 s |
| `club` | Da Club | 124 BPM, 16ths (0.121 s) | Am – F – C – G | 128 steps (8 bars), 15.5 s |
| `arctic` | Station Nord-7 | 66 BPM, 8ths (0.455 s) | Em – C – Am – Bm | 64 steps, 29.1 s |
| `pathos` | Pathos-4 | 62 BPM, 8ths (0.484 s) | F – G – Am – G (F Lydian) | 128 steps, 61.9 s |
| `home` | Mom's Backyard | 88 BPM, 8ths with swing (0.341 s) | Fmaj7 – Dm7 – Gm7 – C7 | 64 steps, 21.8 s |
| `win` | Mission complete | 76 BPM, 8ths (0.395 s) | F – C – Dm – B♭ | 32 steps, 12.6 s |
| `credits` | Credits | 68 BPM, 8ths (0.441 s) | F – C – Dm – B♭ – F – C – B♭ – C | 192 steps (3 passes), 84.7 s |

### What each theme does

- **title:**
  - Each bar: a detuned-saw pad an octave up, a sub sine on the root and a taiko hit.
  - Softer taikos on steps 5 and 6.
  - A high sine arpeggio on the odd steps.
  - On entering the title screen, a single braam on D plays with the announcer.
- **game (Sector B-4):** the military theme.
  - **Harmony:** pad plus sub every bar.
  - **Pluck ostinato:** a 16-step pattern through the triad two octaves up; it jumps an octave in the last 4 steps of bar 4.
  - **Percussion:** taiko on steps 0, 7 and 10; hats on 4 and 12.
  - **Braam** (the "trailer horn": stacked saw and square, distorted, with a resonant filter swell) on bar 1 of every other 4-bar cycle.
- **desert:**
  - **Drones:** low-passed sawtooth on D2 and A2.
  - **Oud melody:** the `HIJAZ` table (4 bars × 16 steps). The oud is a plucked triangle with a 1.4 % pitch drop on the attack plus a short filtered saw.
  - **Darbuka:** *doum* (sine 105 → 58 Hz) on steps 0 and 8; *tek* (band-passed noise at 3.4 kHz) on 2, 6 and 12; ghost teks on 14 and 15.
  - **Alternating cycles:** a braam on one 64-step cycle, a ney (breathy sine, vibrato, falling a whole tone) on the next.
- **club:**
  - **Rhythm:** four-on-the-floor kick (sine 150 → 42 Hz), clap on 2 and 4 (three 8 ms noise bursts plus a tail), open hats on the off-beats, closed hats in between.
  - **Bass:** saw an octave down on the off-beats through a resonant 560 Hz low-pass.
  - **Chords:** chord stabs on steps 3 and 10.
  - **8-bar build:** a square-wave arpeggio enters in bars 5–8 and a noise riser (300 Hz → 6 kHz) sweeps through bar 8 into the next loop.
- **arctic:**
  - **Each bar:** a soft pad (sine plus slightly detuned triangle with slow attack), a sub sine and wind (band-passed noise sweeping 450 → 1500 Hz).
  - **Bells:** inharmonic partials at 1, 2.76 and 5.4 × f. They play two alternating 32-step patterns (`ARCPAT`) through the triad, three octaves up.
  - **Accents:** a distant taiko every other phrase; a high accent bell in bar 4.
- **pathos:** see §4.
- **home:**
  - **Swing:** a lazy backyard shuffle; every odd step is delayed by 22 % of a step.
  - **Rhythm section:** soft kick on 1 and 3, triangle bass walking root–fifth–octave–fifth, a 6 kHz noise shaker on every step.
  - **Keys:** e-piano seventh chords on steps 2 and 6.
  - **Melody:** a whistled tune (`HOMEMEL`, sine that scoops up into each note, with vibrato) on alternate 4-bar phrases.
- **win:** pad, sub and taiko each bar, and a triangle arpeggio three octaves up on every step. It loops until you leave the results screen.
- **credits:** built in three 64-step passes.
  - **Pass 1:** piano melody (`CRMEL`, 8 bars) over pad and sub.
  - **Pass 2:** adds taiko and a piano arpeggio.
  - **Pass 3:** adds big taikos, braams on bars 1 and 5, and a soft saw doubling the melody an octave below.

## 4. Pathos-4: the underwater theme

The brief asked for pan flutes, ocarinas, heavy reverb, Lydian mode and a slow tempo, Subnautica style. This is how it delivers each:

- **Lydian:**
  - The progression is F – G – Am – G over an F tonic. The G major chord puts **B natural (the raised 4th)** against F, the defining Lydian colour.
  - In bar 1 the pad also adds MIDI `r + 18` (B3) to the F chord itself, so the ♯4 sounds right away.
- **Tempo:** 62 BPM in eighths, so one 4-bar phrase lasts 15.5 s.
- **Space:** a dedicated 6.5 s reverb (`A.revL`, send 0.85). The sub sine (1.5 s attack) and every melodic voice feed it.
- **Harp:** a triangle with an octave sine, arpeggiating `[0,1,2,3,2,1,0,1]` through the chord two and three octaves up on every step. This is the steady "water" motion.
- **Pan flute:** sine plus 25 % triangle, 0.18 s attack.
  - **Breath:** a band-passed noise layer at 1.5 × f gives the breathiness.
  - **Vibrato:** delayed, 4.8 Hz, fading in over the first 60 % of the note, up to ±1.2 %.
  - **Phrasing:** plays `PMEL` on even phrases. Notes before a rest are held 2.6 steps, others 1.6.
- **Ocarina:** an almost pure sine with a faint 3rd harmonic, 5.6 Hz vibrato and a quicker attack. It answers on odd phrases (`OMEL`, an octave up).
- **Water:** a slow low-passed noise swell (380 Hz, 6-step attack) every second bar.
- **Whale call:** every 4th phrase, a sine glides 230 → 150 → 270 Hz straight into the long reverb.
- **Under water:** after the flood the whole mix, music included, goes through the master low-pass at 1.2 kHz (see AUDIO.md).
- **No klaxon:** the original Pathos-4 also had a pitched klaxon every 8 s, in a different key. It clashed with the score and was removed. The countdown ticks are unpitched clicks.

## 5. Instruments (`js/audio/instruments.js`)

| Instrument | Recipe | Used by |
|---|---|---|
| `taiko(t, vol, dest)` | Sine 115 → 46 Hz glide plus low-passed noise, into the medium reverb | title, game, arctic, win, credits, intro |
| `pad(notes, t, dur, vol)` | Two sawtooths per note detuned ±9 cents, 760 Hz low-pass, 0.6 s attack | title, game, win, credits |
| `softpad(notes, t, dur, vol)` | Sine plus triangle (+0.3 %), attack 40 % of the note | arctic, pathos |
| `pluck(f, t, vol)` | 90 ms saw, low-pass sweep 2600 → 380 Hz, Q 3 | game |
| `braam(root, t, vol)` | Saw and square on root−24, −12, 0, +7, random detune, resonant LP 110 → 1700 → 260 Hz, `tanh(5x)` | title, game, desert, credits |
| `kick`, `clap`, `hat`, `stab` | See club above | club |
| `oud`, `doum`, `tek`, `ney` | See desert above | desert |
| `bell(f, t, vol)` | Sines at 1, 2.76, 5.4 × f, decays 0.7 / 0.25 / 0.12 s | arctic |
| `flute`, `ocarina`, `harp` | See §4 | pathos |
| `epiano(f, t, vol)` | Sine plus octave plus a slightly detuned triangle | home |
| `whistle(f, t, dur, vol)` | Sine scooping up 3 % in 60 ms, 5.5 Hz vibrato | home |
| `piano(f, t, vol)` | Triangle (0.55 s release) plus octave sine | credits |

All instruments write to `A.duck` (the music bus) plus a reverb send, so radio ducking, pause dimming and the underwater muffle apply to them automatically.

## 6. Exporting the soundtrack

```
npm run ost:cover    # out/ost/cover.jpg (title screen, square)
npm run ost          # render every theme to WAV, then encode
```

- **`tools/ost/render-ost.mjs`:** opens the game headless with `?debug` and calls `window.__render(theme, steps, 10)`.
  - That function (in `js/debug.js`) swaps `A.ctx` for an `OfflineAudioContext` and rebuilds the music bus and reverbs on it.
  - It calls `musicStep()` for every step up front, renders faster than real time and peak-normalises to −1 dBFS.
  - It writes a 24-bit / 48 kHz WAV to `out/ost/wav/`.
  - Each track repeats its full variation cycle (table above) until it is at least 100 s long, then fades out over 10 s.
- **`tools/ost/encode_ost.py`:**
  - **Loudness:** measures it with `ffmpeg ebur128` and turns tracks down to −16 LUFS. Quieter tracks are not boosted, so nothing clips and no limiter is needed.
  - **Formats:** MP3 320 kbps and FLAC 24-bit with tags and the cover, then two zips in `out/ost/`.
- **Every export differs:** the reverbs and noise are random, so each export is a slightly different performance.

## 7. Adding a theme

1. Pick a tempo: add `STEP.mytheme = 60 / BPM / subdivision` in `js/audio/music.js`.
2. Add data: `PROG.mytheme` (one chord per bar) and any melody arrays.
3. Add an `else if (mode === 'mytheme') { ... }` branch to `musicStep(mode, s, t)`. Derive `bar`/`st` from `s`, play instruments at time `t`, and send to `A.duck` (and `A.sendM` or `A.sendL` for reverb). Keep any randomness inside the step.
4. Use it: set `mus: 'mytheme'` on a chapter in `js/data/fields.js`, or call `musicStart('mytheme')`.
5. Add its cycle length to `CYCLE` in `tools/ost/render-ost.mjs` and a title to `TRACKS` in `tools/ost/encode_ost.py`.
6. Listen in the browser (`npm run dev`, then use the chapter select). Claude can't hear it, but it can render it with `node tools/ost/render-ost.mjs mytheme` and check loudness and a spectrogram.

**Tips:**
- Keep each step light. The club schedules about 15 nodes per 16th note, which is comfortable.
- Avoid sustained pitched sound effects in a chapter with a strongly modal theme: they will fight the key, as the Pathos-4 klaxon did.
