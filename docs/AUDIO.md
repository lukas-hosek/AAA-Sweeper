# Sound system

Every sound in the game except the voice lines is synthesised at runtime with the Web Audio API: sound effects, intro stings, music, radio squelch and tinnitus. There are no audio sample files besides the 197 voice MP3s. Music has its own document: [MUSIC.md](MUSIC.md).

Code, all in `js/audio/`:
- `audio-engine.js`: the graph and the primitives (`audioEngine`)
- `sound-effects.js`: the effects (`soundEffects`)
- `voice-bank.js`: MP3 loading and caching (`voiceBank`)
- `voice-manager.js`: playing voice lines (`voices`)
- `chatter-scheduler.js`: choosing ambient radio lines (`chatter`)
- `instruments.js`, `music-sequencer.js` and `themes/`: the music


## 1. The audio graph

`audioEngine.Init()` builds the graph on the first user gesture (clicking the desktop icon, the title screen or the board). Browsers refuse to start an `AudioContext` before a gesture. Everything else checks `audioEngine.context` and silently does nothing without it.

```
 music voices ─► duckBus ─► musicBus (settings.musicVolume) ─┐
   musicReverbSend ─► musicReverb (2.8 s) ─► duckBus         │
   longReverbSend ─► longReverb (6.5 s) ─► duckBus           │
                                                             ├─► master (settings.masterVolume, 0 when muted)
 sound effects ─► effectsBus (settings.effectsVolume) ───────┤        │
   effectsReverbSend ─► effectsReverb (1.7 s) ─► effectsBus  │        ▼
                                                             │   muffle: low-pass (19 kHz normally)
 voice lines ─► voiceBus (settings.voiceVolume) ─────────────┘        │
                 └─► voiceAnalyser (drives the radio waveform)        ▼
                                                         compressor (−12 dB, 4:1, knee 8, 4 ms / 250 ms)
                                                              │
                                                         destination
```

- **`duckBus`** is a gain in front of the music bus. A radio transmission ducks it to 0.36 (time constant 0.12 s). When the last radio voice ends it recovers to 1 (0.2 s delay, then 0.4 s time constant).
- **Pausing** lowers the music bus to 45 % (`ApplyVolumes()`).
- **Reverbs** are `ConvolverNode`s with procedurally generated impulse responses. `MakeImpulseResponse(seconds)` fills a stereo buffer with white noise times `(1 − t/T)^3.4`. Each channel gets independent noise, which gives the stereo width. Instruments reach a reverb through its send gain: music 0.55, effects 0.5, long 0.85.
- **Shared buffers:**
  - `noiseBuffer`: 2 s of white noise, looped from a random offset by every noise voice
  - `radioCurve`: `tanh(2.4x)`, the radio distortion
  - `boomCurve`: `tanh(5x)`, the explosion grit
- **The master compressor** glues everything together and keeps explosions from clipping.
- **Offline rendering:** `BeginOfflineRender(offlineContext, musicGain)` rebuilds the graph inside an `OfflineAudioContext` (soundtrack export, golden audio checks); `EndOfflineRender()` restores the live graph.

### The muffle filter
- **What it is:** one low-pass filter on the master bus, so everything is muffled at once, music and voices included.
- **`muffleBaseFrequency`** is its resting cutoff: 19 kHz normally, 1.2 kHz while Pathos-4 is flooded (`flood.Flood()` calls `MuffleTo`).
- **`Shellshock()`** runs on every mine hit. It drops the cutoff to 300 Hz and ramps back to the base over 2.9 s. It also plays a 3.9 kHz sine "tinnitus" straight into the compressor, so it is not muffled by itself.
- **`Unmuffle()`** resets to 19 kHz. It runs when a game starts and on quitting to the title, desktop or credits.


## 2. Primitives

All sound is built from three `audioEngine` methods:

```js
ApplyEnvelope(gainNode, time, attack, peak, duration, release)   // 0 → peak (linear) → hold → exponential-ish decay
PlayTone(waveform, frequency, time, duration, volume, destination, options)   // one oscillator with an envelope
PlayNoise(time, duration, volume, destination, options)                       // filtered noise burst with an envelope
```

| `PlayTone` option | Effect |
|---|---|
| `attack`, `release` | Envelope times (defaults 0.005 s and 0.05 s) |
| `glideTo`, `glideSeconds` | Exponential pitch glide to `glideTo` Hz |
| `detune` | Detune in cents |
| `lowpass`, `lowpassEnd`, `resonance` | Low-pass filter, optionally sweeping over the note |
| `send` | Also connect to a reverb send |

`PlayNoise` takes `filterType` (default bandpass), `frequency`, `frequencyEnd` (sweep), `resonance`, `attack`, `release` and `send`.

**Nodes are fire-and-forget.** Every call creates fresh nodes, starts them at an exact `AudioContext` time and schedules `stop()` after the release, and the browser garbage-collects them. Nothing is pooled or reused. That is cheap enough even for the club music (about 15 nodes per 16th note).


## 3. Sound effects (`soundEffects`)

| Method | When | Recipe |
|---|---|---|
| `MenuSelect`, `MenuHover` | Menus | Short high sine or square blips |
| `Reveal(tileCount)` | Opening tiles | Triangle chirp rising with the count. For 6+ tiles, a filtered noise whoosh and a 6-note arpeggio |
| `Flag` / `Unflag` | Flagging | Low sine thump with a pitch drop and a cloth-like noise tick |
| `Denied` | Illegal action | Two low square beeps |
| `Explosion` | Mine | Noise through a 5 kHz → 110 Hz low-pass sweep and a 95 → 28 Hz sine, both through the `tanh(5x)` shaper; a 52 Hz triangle tail; 12 random debris ticks; reverb |
| `Heartbeat` | Health below 40 | Two low sine thumps (lub-dub) |
| `LevelUp`, `Achievement`, `Coin`, `NewQuest`, `LoreFound` | Rewards | Bright arpeggios and bells |
| `Whoosh` | Banners, supply drop | Band-pass noise sweep 250 Hz → 3.8 kHz |
| `Respects` | Press F | Soft sawtooth C major chord, low-passed |
| `FlagTune` | Musical Flag skin | Six-note square jingle |
| `Ding` | Win98 message box | Two sines |
| `CrateThud` | Supply drop lands | Low noise thud |
| `Bubbles`, `Flood` | Pathos-4 | Sine blips with fast upward glides; the flood is a long low-passed noise roar with a 45 Hz rumble and bubbles |
| `CountdownTick` | Last 10 s before the flood | Unpitched noise click. A pitched tick (and a klaxon) clashed with the Pathos-4 music and were removed |
| `IntroSting(logo)` | Intro logo cards | `engine`: low swell and two shimmering partials. `physics`: six clattering impacts and a thud. `blink`: two eyelid clicks and a pad. `ice`: random high crystalline sines. `megalith`: taiko and a low chord |


## 4. Voice lines

### Files and loading
- **Files:** `assets/voices/<id>.mp3`, mono, 24 kHz, 32–40 kbps.
- **Metadata:** `VOICE_LINES` in `js/data/voice-manifest.js` (generated): `duration` (seconds), and `speaker` and `subtitle` for lines after the first batch.
- **Loading:** `voiceBank.Decode(id)` fetches the MP3, decodes it with `decodeAudioData` and caches the `AudioBuffer`.
- **Cache:** an LRU of 52 decoded buffers. Decoded audio is float PCM at the context rate, roughly 1 MB per line. Ids in `PINNED_LINES` (`data/chatter.js`) are never evicted, and neither are lines playing or queued. Pinned lines are event barks that must play instantly: hits, flags, low health, system lines, the Pathos-4 flood lines. `voiceBank.Init()` predecodes them as soon as audio starts.
- **Prefetch:** `Mission.Start` predecodes the chapter's announcer line, opening line, opening chatter and victory lines. After each chatter line starts, the next one is chosen and decoded in the background (`chatter.queuedLine`).

### Who is speaking
- `SpeakerOf(id)` (`data/characters.js`) returns the manifest's `speaker`, or for the first batch the speaker of the id's first letter: `r` Reyes, `k` Kova, `d` Dez, `q` Quartermaster, `m` Mom, `j` Jenkins, `w` whisper, `s` system, `a` announcer.
- `SubtitleOf(id)` (`data/subtitles.js`) returns the subtitle.
- `CHARACTERS[speaker]` holds the display name, channel number, colour and flags: `isRadio`, `isPhone`, `isEerie`, `isPublicAddress`, `hideSubtitles`.

### `voices.Say(id, options)`: the radio chain
For characters with `isRadio`, the buffer goes through a radio emulation chain:

```
source ─► high-pass 300 Hz (phone: 450) ─► peaking +6 dB @ 1.7 kHz (Q 0.9) ─► gain ×1.7
       ─► waveshaper tanh(2.4x), 2× oversampling ─► low-pass 3.1 kHz (phone: 3.4 kHz) ─► gain 1.1 ─► voiceBus
                                                         └─► delay 0.13 s (public address) / 0.24 s (eerie), feedback 0.3/0.4 ─┘
```

- **Squelch:** a 0.17 s lead-in. A band-passed noise burst plus a short sine "chirp" at the start (1350 Hz) and end (900 Hz) of every transmission, and a quiet high-passed hiss under the line.
- **Ducking:** the music ducks while any radio voice plays.
- **Overlap:** at most two radio voices at once. A third stops the oldest, and voices in the background drop to 0.32 gain.
- **Non-radio voices** (the system and the announcer) play clean at 0.95 gain. The announcer has no subtitles.
- **Subtitles** (`#subtitles`, at most 3 lines) show only on the game screen and when enabled. Each one fades out when its line ends.
- **The radio panel** (`radioPanel`) shows the speaker's procedurally drawn portrait (`portraitPainter`), name and channel, and a live waveform from `voiceAnalyser`.

### Barks: event lines with cooldowns
`voices.Bark(id, cooldownKey, cooldownSeconds, options)` plays a line unless `cooldownKey` was used less than `cooldownSeconds` ago (in game time), so repeated events don't spam. Outside a game it just calls `Say`. Main triggers:

| Event | Line(s) |
|---|---|
| Chapter start | Announcer chapter name (`a_ch…`), then the chapter's opening line (Reyes, Dez, Mom...) |
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
| Win | `a_complete`, then the chapter's two victory lines |
| Pathos-4 | `s_breach` (12 s in), `s_flood` and `rp_2` (30 s left), `rp_flood` and `hc_flood` (after the flood), then `rp_3`, `jp_3`, `mp_2` |

**Side effects after a line ends:**
- `SIDE_QUEST_AFTER_LINE` hands out side quests (e.g. `k_1` adds Kova's upgrade quest).
- `d_5` makes the club arrive (`clubNight.Start()`), unless the chapter is Da Club.
- Quartermaster lines sometimes trigger a "LIMITED TIME OFFER" toast.


## 5. Radio chatter

`chatter` (`audio/chatter-scheduler.js`) decides what the cast says when nothing happens.

**Per-chapter data** (`CHAPTER_CHATTER[chapter.id]` in `data/chatter.js`):
- `openingLines`: played first, in order (e.g. Kova's apology then "Get yo ass in da club" in Sector B-4)
- `arcs`: per character, an ordered list of lines (a mini-story per chapter)
- `favouriteSpeakers`: picked more often, with weight `favouriteWeight` (default 2.2, Station Nord-7 uses 4). Everyone else weighs 1, the whisper 0.6.
- `shuffledArcs`: characters whose arc (after their first line) is shuffled every run (Prof. Lindqvist)

**Picking the next line** (`chatter.NextLine()`):
1. The next opening line, if any.
2. Otherwise a weighted random character among those with lines left, never the same speaker twice in a row if avoidable. Take the next line of their arc.
3. When every arc is used up: `SHARED_CHATTER` (chapter-neutral lines, shuffled once per campaign).
4. Then `REPEATABLE_LINES`: a shuffled list of the funniest lines, cycling forever.

**Timing** (`Mission.Update`):

| `settings.chatter` | Gap after a line ends (`chatter.Gap()`) |
|---|---|
| `off` | No chatter (events still bark) |
| `normal` (default) | 11–19 s |
| `constant` | 3.5–7 s |
| `unbearable` | 0.5–1.6 s |

The first line comes 9 s after the chapter starts.

**No overlapping on Normal or Off (calm mode).**
- If a voice is already playing, a new chatter line is skipped.
- Other lines wait and play 450 ms after the current one finishes. Lines older than 6 s are dropped.
- The announcer may always interrupt.
- On Constant and Unbearable, lines overlap on purpose (up to two radio voices).


## 6. Volumes and settings

- **Sliders:** `settings.masterVolume`, `musicVolume`, `voiceVolume`, `effectsVolume` (0–1) map onto the bus gains in `audioEngine.ApplyVolumes()`, smoothed with `setTargetAtTime`.
- **Mute:** M or the HUD button. It sets the master to 0, and the tinnitus respects it too.
- **Defaults:** master 0.9, music 0.5, voices 1, effects 0.8.


## 7. Testing audio without ears

Headless Chromium plays audio into nothing, so tests check state instead, through the `?debug` hooks:
- `testHooks.CurrentMusicTheme()`: the theme playing
- `testHooks.DecodedVoiceCount()`: decoded buffers in the cache
- `testHooks.VoiceStatus()`: voices playing and the queued chatter line
- `testHooks.Say(id)`: play a line now

The golden comparison (`scripts/golden.sh`) renders every music theme and every sound effect offline and compares their loudness envelopes with the recorded baseline.

For the music itself, render it to WAV (`.venv/bin/python tools/ost/render_ost.py <theme>`, written to `out/ost/wav/`) and inspect it:
- loudness: `ffmpeg -i x.wav -af ebur128 -f null -`
- spectrogram picture: `ffmpeg -i x.wav -lavfi showspectrumpic=s=1200x400 spec.png`

Then look at the picture. See [TESTING.md](TESTING.md).
