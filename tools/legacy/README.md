# Legacy scripts (reference only)

These are the original scripts Claude wrote while building the single-file version of the game, in a cloud sandbox. They are kept because they document how things were made. **They are not meant to be run.** They contain absolute paths from that sandbox (`/tmp/claude-0/...`, `/home/claude/...`) and target the old single-file template. Their working replacements live one level up in `tools/`.

| Folder | Files | What they did |
|---|---|---|
| `tts/` | `gen.py`, `gen2.py`, `gen3.py`, `gen4.py` | Kokoro TTS for the four voice batches (50 + 100 + 27 + 20 lines). Wrote `voices*.json` with base64 MP3s. Now `tools/tts/generate_voices.py` + `lines.py` (same line lists, verbatim) |
| `build/` | `build.py` | Merged the voice JSON into `template.html` (`const VOICES=/*__VOICES__*/{}`) and wrote the published HTML plus a test copy with debug hooks. Now `tools/build/build-single.mjs` |
| `patches/` | `patch2.py` … `patch5.py` | Feature patches applied to the single-file template by exact string replacement: chapters + blood + 100 lines (2), credits (3), arctic/home music and tilesets (4), Pathos-4 (5). They show what each feature touched |
| `tests/` | `run*.py`, `br*.py`, `kx.py`, `pr.py`, `dbg.py` | Python Playwright scripts: screenshots per layout, the Pathos-4 breath readout, the klaxon removal check, the Lindqvist lines check. Now `tools/browser/` |
| `ost/` | `mkrender.py`, `render.py`, `enc.py`, `cover.py` | First soundtrack export. Now `tools/ost/` |
| `migration/` | `mkws.py`, `split.mjs`, `extract.mjs`, `list.mjs` | Created this workspace from the single file. `split.mjs` is the AST-based splitter (Babel + magic-string) that generated `js/` (see docs/ARCHITECTURE.md §9) |
