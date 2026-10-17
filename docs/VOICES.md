# Voice lines and the TTS pipeline

All 197 voice lines were generated offline with **Kokoro** (Kokoro-82M, an open-weights text-to-speech model). It runs on the CPU through ONNX Runtime with the `kokoro-onnx` Python package. No cloud service or API key is involved.

```
tools/tts/lines.py            every line: id, speaker, text for TTS, subtitle (source of truth)
tools/tts/generate_voices.py  synthesises lines -> public/voices/<id>.mp3 and updates the manifest
tools/tts/download_models.sh  fetches the model files into tools/tts/models/ (about 120 MB, gitignored)
tools/tts/requirements.txt    Python packages
js/data/voice-manifest.js     GENERATED: id -> {d: seconds, w: speaker, t: subtitle}
public/voices/*.mp3           the audio, mono 24 kHz, 32–40 kbps (about 4.6 MB total)
```

## Setup (once)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r tools/tts/requirements.txt
bash tools/tts/download_models.sh     # verifies SHA-256 of both files
python3 tools/tts/generate_voices.py --check
```

## Commands

```bash
python3 tools/tts/generate_voices.py                 # generate lines that have no MP3 yet
python3 tools/tts/generate_voices.py pa_25 hc_4      # (re)generate specific ids
python3 tools/tts/generate_voices.py --force         # regenerate all 197 (several minutes)
python3 tools/tts/generate_voices.py --check         # consistency check, no TTS
python3 tools/tts/generate_voices.py --say prof "Testing, one two."   # preview -> out/tts/preview.mp3
```

**Generation is deterministic** for the same model files and package versions. Regenerating an existing line produced a byte-identical MP3 when this workspace was set up. A different `kokoro-onnx` or model version will sound slightly different.

## How a line is made

1. `kokoro.create(text, voice, speed, lang)` returns 24 kHz float audio. `lang` is `en-gb` for voices starting with `b`, `en-us` otherwise.
2. 0.12 s of silence is appended so the radio squelch doesn't clip the last word.
3. ffmpeg encodes it to mono 24 kHz MP3: 40 kbps for batch 1 (the original lines), 32 kbps for later batches.
4. The duration (`d`) goes into the manifest. For batch 2 and later, the speaker (`w`) and subtitle (`t`) go in too.

## The cast (`VOICE` in lines.py)

| Speaker key | Character | Kokoro voice | Speed | Game-side treatment |
|---|---|---|---|---|
| `reyes` | Cmdr. Reyes | `am_onyx` | 1.0 | Radio |
| `kova` | Dr. Mirela Kova | `af_bella` | 1.0 | Radio |
| `dez` | Big Dez | `am_puck` | 1.12 | Radio |
| `qm` | Quartermaster Pryce | `bm_george` | 1.05 | Radio |
| `mom` | Mom | `af_heart` | 1.0 | Phone (narrower band) |
| `jenkins` | Pvt. Jenkins | `am_liam` | 1.15 | Radio |
| `whisper` | ??? | `bm_lewis` | 0.8 | Radio and long echo |
| `dj` | DJ Detonator | `am_michael` | 1.12 | Radio and PA echo |
| `prof` | Prof. Lindqvist | `bf_alice` | 0.98 | Radio |
| `halcyon` | HALCYON | `af_sky` | 0.92 | Radio and PA echo |
| `sys` | SYSTEM | `af_nova` | 0.95 | Clean |
| `announcer` | Trailer announcer | `am_fenrir` | 0.82 | Clean, no subtitles |

Kokoro v1.0 ships many more voices (American/British, female/male: `af_*`, `am_*`, `bf_*`, `bm_*`). Preview one with `--say`. To try a new voice, add a speaker to `VOICE`.

## Line ids

`<speaker><chapter>_<n>`, for example `pa_7` (Prof., Arctic, 7), `hc_flood` (HALCYON, flood), `rd_win` (Reyes, Desert, win).

| Part | Letters |
|---|---|
| Speaker | `r` Reyes, `k` Kova, `d` Dez, `q` Quartermaster, `m` Mom, `j` Jenkins, `w` whisper, `s` system, `a` announcer; `dj_` DJ, `p?_` Prof., `hc_` HALCYON |
| Chapter | (none) Sector B-4, `d` desert, `c` club, `a` arctic, `p` Pathos-4, `h` home, `g` generic/shared |

Event barks have descriptive names: `r_hit3`, `j_low`, `s_ach`, `a_ch5p`.

**Batch 1 is special:** its 50 lines have no speaker or subtitle in the manifest.
- The speaker comes from the first letter of the id (`PREFIX` in `js/data/dialogue.js`).
- The subtitle comes from `SUBS` in the same file.
- If you change a batch-1 line's text, update `SUBS` too.

## Writing lines that TTS reads well

- **Spell out for the voice, write normally for the subtitle.** Use the 4th tuple field:
  `('pa_7','prof',"These ice cores are forty thousand years old...","These ice cores are 40,000 years old...")`.
- **Names with digits or hyphens:** write "Pathos four", "Nord Seven", "minus forty" for TTS; the subtitle shows "Pathos-4", "Nord-7", "−40°".
- **Punctuation shapes the delivery.** Periods give pauses, commas give short breaths, and an exclamation mark adds energy. Long lines (over about 12 s) feel wrong on the radio. Keep most lines between 2 and 9 s.
- **Character voice:** see GAME_DESIGN.md §9. One joke per line.

## Adding a line

1. **Write it.** Add the tuple to the newest batch in `tools/tts/lines.py` (or start a `BATCH5` and register it in `BATCHES`, with `bitrate: '32k', manifest_text: True`).
2. **Generate it:** `python3 tools/tts/generate_voices.py <id>`. This writes the MP3 and the manifest entry.
3. **Wire it into the game:**
   - **Chapter chatter:** append the id to the character's arc in `CHAT.<theme>.arcs` (`js/data/dialogue.js`). Add it to `open` to have it play first.
   - **Any chapter:** add it to `SHARED` (played after the arcs) or `REPEATS`.
   - **Event bark:** call `bark('<id>', '<cooldownKey>', seconds)` where the event happens. If it must play instantly, add the id to `PIN` so it stays decoded.
   - **Quest on a line:** map the id to a side-quest key in `QUEST_ON_LINE`.
4. **Check:** `python3 tools/tts/generate_voices.py --check`, then `npm run smoke`. Run `npm run build` if you ship the single file.

**Removing a line:** delete it from `lines.py`, its MP3 and its manifest row (or regenerate the manifest), and remove every reference in `js/`.

## History

The original generation scripts (`gen.py`, `gen2.py`, `gen3.py`, `gen4.py`) are in `tools/legacy/tts/`. They wrote JSON with base64 MP3s that were embedded into the single HTML file. `lines.py` contains their line lists verbatim.
