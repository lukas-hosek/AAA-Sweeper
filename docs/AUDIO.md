# Sound system

Every sound in the game except the voice lines is synthesised at runtime with the Web Audio API: sound effects, intro stings, music, radio squelch and tinnitus. There are no audio sample files besides the 197 voice MP3s. Music has its own document: [MUSIC.md](MUSIC.md).

Code: `js/audio/engine.js` (graph and primitives), `js/audio/sfx.js` (effects), `js/audio/voice-bank.js` (MP3 loading), `js/audio/voices.js` (voice manager), `js/audio/instruments.js` and `js/audio/music.js` (music).

## 1. The audio graph

`audioInit()` builds the graph on the first user gesture (clicking the desktop icon, the title screen or the board). Browsers refuse to start an `AudioContext` before a gesture. Everything else checks `A.ctx` and silently does nothing without it.

```
 music voices ─► A.duck ─► A.music (settings.music) ─┐
   A.sendM ─► A.revM (2.8 s reverb) ─► A.duck         │
   A.sendL ─► A.revL (6.5 s reverb) ─► A.duck         │
                                                      ├─► A.master (settings.master, 0 when muted)
 sound effects ─► A.sfx (settings.sfx) ──────────────┤        │
   A.sendS ─► A.revS (1.7 s reverb) ─► A.sfx          │        ▼
                                                      │   A.muf  low-pass "muffle" (19 kHz normally)
 voice lines ─► A.voice (settings.voice) ────────────┘        │
                 └─► A.an (analyser, drives the radio waveform)▼
                                                         compressor (−12 dB, 4:1, knee 8, 4 ms / 250 ms)
                                                              │
                                                         destination
```

- **`A.duck`** is a gain in front of the music bus. A radio transmission ducks it to 0.36 (time constant 0.12 s). When the last radio voice ends it recovers to 1 (0.2 s delay, then 0.4 s time constant).
- **Pausing** sets the music bus to 45 % (`setVol()`).
- **Reverbs** are `ConvolverNode`s with procedurally generated impulse responses. `makeIR(seconds)` fills a stereo buffer with white noise times `(1 − t/T)^3.4`. Each channel gets independent noise, which gives the stereo width. Instruments reach a reverb through its send gain: `sendM` 0.55, `sendS` 0.5, `sendL` 0.85.
- **Shared buffers:**
  - `A.noise`: 2 s of white noise, looped from a random offset by every noise voice
  - `A.radioCurve`: `tanh(2.4x)`, the radio distortion
  - `A.boomCurve`: `tanh(5x)`, the explosion grit
- **The master compressor** glues everything together and keeps explosions from clipping.

### The muffle filter `A.muf`
- **What it is:** one low-pass filter on the master bus, so everything is muffled at once, music and voices included.
- **`A.mufBase`** is its resting frequency: 19 kHz normally, 1.2 kHz while Pathos-4 is flooded (`floodNow()`).
- **`shellshock()`** runs on every mine hit. It drops the cutoff to 300 Hz and ramps back to `mufBase` over 2.9 s. It also plays a 3.9 kHz sine "tinnitus" straight into the compressor, so it is not muffled by itself.
- **`unmuffle()`** resets to 19 kHz. It runs when a game starts and on quitting to the title, desktop or credits.

## 2. Primitives

All sound is built from three helpers in `engine.js`:

```js
env(gainNode, t, attack, peak, dur, release)    // 0 → peak (linear) → hold → exponential-ish decay (setTargetAtTime)
osc(type, freq, t, dur, vol, dest, opts)        // one oscillator with envelope; returns its gain node
nz(t, dur, vol, dest, opts)                     // filtered noise burst from A.noise with envelope
```

| `osc()` option | Effect |
|---|---|
| `a` | Attack time |
| `rel` | Release time |
| `glide` + `gt` | Exponential pitch glide to `glide` Hz over `gt` s |
| `det` | Detune in cents |
| `lp`, `lp2`, `q` | Low-pass filter, optionally sweeping from `lp` to `lp2` over the note |
| `send` | Also connect to a reverb send |

`nz()` uses `type` (biquad type, default bandpass), `f`, `f2` (sweep), `q`, `a`, `rel` and `send`.

**Nodes are fire-and-forget.** Every call creates fresh nodes, starts them at an exact `AudioContext` time and schedules `stop()` after the release, and the browser garbage-collects them. Nothing is pooled or reused. That is cheap enough even for the club music (about 15 nodes per 16th note).

## 3. Sound effects (`S` in `sfx.js`)

| Method | When | Recipe |
|---|---|---|
| `ui`, `hover`, `click` | Menus | Short high sine or square blips |
| `reveal(n)` | Opening tiles | Triangle chirp rising with `n`. For 6+ tiles, a filtered noise whoosh and a 6-note arpeggio |
| `flag` / `unflag` | Flagging | Low sine thump with a pitch drop and a cloth-like noise tick |
| `denied` | Illegal action | Two low square beeps |
| `boom` | Mine | Noise through a 5 kHz → 110 Hz low-pass sweep and a 95 → 28 Hz sine, both through the `tanh(5x)` shaper; a 52 Hz triangle tail; 12 random debris ticks; reverb |
| `heart` | Health below 40 | Two low sine thumps (lub-dub) |
| `level`, `ach`, `coin`, `quest`, `lore` | Rewards | Bright arpeggios and bells |
| `whoosh` | Banners, supply drop | Band-pass noise sweep 250 Hz → 3.8 kHz |
| `respects` | Press F | Soft sawtooth C major chord, low-passed |
| `tune` | Musical Flag skin | Six-note square jingle |
| `ding` | Win98 message box | Two sines |
| `crate` | Supply drop lands | Low noise thud |
| `bubble`, `flood` | Pathos-4 | Sine blips with fast upward glides; the flood is a long low-passed noise roar with a 45 Hz rumble and bubbles |
| `ctick` | Last 10 s before the flood | Unpitched noise click. It replaced a pitched tick that clashed with the music |
| `tick`, `klaxon` | No longer used | Kept for reference. The klaxon was removed from Pathos-4 because it was pitched and clashed with the Lydian music |
| `sting(kind)` | Intro logo cards | `engine`: low swell and two shimmering partials. `physics`: six clattering impacts and a thud. `blink`: two eyelid clicks and a pad. `ice`: random high crystalline sines. `megalith`: taiko and a low chord |

## 4. Voice lines

### Files and loading
- **Files:** `assets/voices/<id>.mp3`, mono, 24 kHz, 32–40 kbps.
- **Metadata:** `js/data/voice-manifest.js`, with `d` (seconds), and `w` (speaker) and `t` (subtitle) for lines after the first batch.
- **Loading:** `decodeOne(id)` fetches the MP3, decodes it with `decodeAudioData` and caches the `AudioBuffer` in `A.buffers`.
- **Cache:** an LRU of 52 decoded buffers. Decoded audio is float PCM at the context rate, roughly 1 MB per line. Ids in `PIN` (`data/dialogue.js`) are never evicted. These are event barks that must play instantly: hits, flags, low health, system lines, the Pathos-4 flood lines.
- **Prefetch:** `startGame` decodes the chapter's announcer line, start line, opening chatter and win lines up front. After each chatter line starts, the next one is chosen and decoded in the background (`VM.queued`).

### Who is speaking
- `whoOf(id)` returns `VOICES[id].w`, or for the first batch `PREFIX[first letter]`: `r` Reyes, `k` Kova, `d` Dez, `q` Quartermaster, `m` Mom, `j` Jenkins, `w` whisper, `s` system, `a` announcer.
- `lineText(id)` returns `SUBS[id]` or `VOICES[id].t`.
- `CHAR[who]` holds the display name, channel number, colour and flags: `radio`, `phone`, `eerie`, `pa`, `nosub`.

### `say(id, opts)`: the radio chain
For characters with `radio: true` the buffer goes through a radio emulation chain:

```
source ─► high-pass 300 Hz (phone: 450) ─► peaking +6 dB @ 1.7 kHz (Q 0.9) ─► gain ×1.7
       ─► waveshaper tanh(2.4x), 2× oversampling ─► low-pass 3.1 kHz (phone: 3.4 kHz) ─► gain 1.1 ─► A.voice
                                                         └─► delay 0.13 s (pa) / 0.24 s (eerie), feedback 0.3/0.4 ─┘
```

- **Squelch:** a 0.17 s lead-in. `squelch()` plays a band-passed noise burst plus a short sine "chirp" at the start (1350 Hz) and end (900 Hz) of every transmission. `hiss()` adds a quiet high-passed noise bed under the line.
- **Ducking:** the music ducks while any radio voice plays.
- **Overlap:** at most two radio voices at once. A third stops the oldest, and voices in the background drop to 0.32 gain.
- **Non-radio voices** (`sys`, `announcer`) play clean at 0.95 gain. The announcer has no subtitles.
- **Subtitles** (`#subs`, at most 3 lines) show only on the game screen and when enabled. Each one fades out when its line ends.
- **The radio panel** shows the speaker's procedurally drawn portrait (`ui/radio.js`), name, channel and a live waveform from the analyser.

### Barks: event lines with cooldowns
`bark(id, cooldownKey, seconds, opts)` plays a line unless `cooldownKey` was used less than `seconds` ago (measured in game time), so repeated events don't spam. Outside a game it just calls `say`. Main triggers:

| Event | Line(s) |
|---|---|
| Chapter start | Announcer chapter name (`a_ch…`), then the chapter start line (Reyes, Dez, Mom...) |
| Mine hit | `r_hit1`–`r_hit5`, `j_hit` (cooldown 7 s). Mom calls 10 s after your first mine (`m_4`) |
| First flag, some flags | `r_flag`, `r_flag2`, `r_flag3` |
| 20+ tiles at once | `r_area`, `r_area2`, `j_area` |
| Idle 13 s | `r_idle`, `r_idle2`, `j_idle` |
| Health below 40 | `s_crit`, then `j_low` |
| Halfway through the field | `r_half` |
| Level up / every second level | `s_level` / `s_season` |
| Achievement, quest, autosave, supply drop, objective, challenge, store, unspent skill point | `s_ach`, `s_quest`, `s_save`, `s_drop`, `s_obj`, `s_chal`, `s_store`, `s_skill` |
| First lore fragment | `j_lore` or `r_lore` |
| Death, checkpoint | `r_dead`, `k_dead`; `s_check`, `j_respawn` |
| Win | `a_complete`, then the chapter's two `win` lines |
| Pathos-4 | `s_breach` (12 s in), `s_flood` and `rp_2` (30 s left), `rp_flood` and `hc_flood` (after the flood), then `rp_3`, `jp_3`, `mp_2` |

**Side effects after a line ends** (`onLineEnd`):
- `QUEST_ON_LINE` adds side quests to the quest log (e.g. `k_1` adds Kova's upgrade quest).
- `d_5` makes the club arrive.
- Quartermaster lines sometimes trigger a "LIMITED TIME OFFER" toast.

## 5. Radio chatter manager

`VM` in `audio/voices.js` decides what the cast says when nothing happens.

**Per-chapter data** (`CHAT[theme]` in `data/dialogue.js`):
- `open`: lines played first, in order (e.g. Kova's apology then "Get yo ass in da club" in Sector B-4)
- `arcs`: per character, an ordered list of lines (a mini-story per chapter)
- `fav`: characters picked more often, with weight `favW` (default 2.2, Station Nord-7 uses 4). Everyone else weighs 1, the whisper 0.6.
- `shuf`: characters whose arc (after their first line) is shuffled every run (Prof. Lindqvist)

**Picking the next line** (`nextChatter()`):
1. Next `open` line, if any.
2. Otherwise a weighted random character among those with lines left, never the same speaker twice in a row if avoidable. Take the next line of their arc.
3. When every arc is used up: the `SHARED` pool (chapter-neutral lines, shuffled once per campaign).
4. Then `REPEATS`: a shuffled list of the funniest lines, cycling forever.

**Timing** (`gameUpdate`):

| `settings.chatter` | Gap after a line ends |
|---|---|
| `off` | No chatter (events still bark) |
| `normal` (default) | 11–19 s |
| `constant` | 3.5–7 s |
| `unbearable` | 0.5–1.6 s |

The first line comes 9 s after the chapter starts.

**No overlapping on Normal or Off (calm mode).**
- If a voice is already playing, a new chatter line is skipped.
- Other lines wait in `VM.wait` and play 450 ms after the current one finishes. Lines older than 6 s are dropped.
- The announcer may always interrupt.
- On Constant and Unbearable, lines overlap on purpose (up to two radio voices).

## 6. Volumes and settings

- **Sliders:** `settings.master/music/voice/sfx` (0–1) map onto the bus gains via `setVol()`, smoothed with `setTargetAtTime`.
- **Mute:** M or the HUD button. It sets the master to 0, and tinnitus respects it too.
- **Defaults:** master 0.9, music 0.5, voice 1, sfx 0.8.

## 7. Testing audio without ears

Headless Chromium plays audio into nothing, so tests check state instead:
- `__t.mus()`: current music theme
- `__t.voicesLoaded()`: decoded buffer count
- `__t.VM()`: chatter state
- `__t.say(id)`: play a line now

For the music itself, render it offline to WAV (`.venv/bin/python tools/ost/render_ost.py <theme>`, written to `out/ost/wav/`) and inspect it:
- loudness: `ffmpeg -i x.wav -af ebur128 -f null -`
- spectrogram picture: `ffmpeg -i x.wav -lavfi showspectrumpic=s=1200x400 spec.png`

Then look at the picture. See [TESTING.md](TESTING.md).
