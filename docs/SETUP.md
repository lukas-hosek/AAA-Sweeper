# Setting up your Linux machine

This guide assumes **Ubuntu 24.04, Debian 12 or Linux Mint 22**. Other distributions work too; see §8. It covers everything needed for you **and for Claude Code** to do every task in this project:
- run the game with the dev server and edit it
- run headless browser tests, screenshots and the JavaScript lint
- generate voice lines with TTS
- export the soundtrack

Expect about 10 minutes and roughly 1.1 GB of disk space:

| Item | Size |
|---|---|
| Playwright's Chromium | ~660 MB |
| The Python packages | ~330 MB |
| The TTS model | ~120 MB |

The game itself is plain HTML, CSS and JavaScript modules: it has no build step and no dependencies. Everything below is tooling. **Node.js and npm are not used.**

## What you will install, and why

| Tool | What it is | Why this project needs it |
|---|---|---|
| **git** | Version control | Track changes |
| **curl** | Download tool | The scripts use it to check the dev server and to download the TTS model |
| **Python 3.10–3.13** with **venv** | Python runtime and isolated environments | Runs the dev server and every tool. The tool packages live in `.venv/`, not in the system Python |
| **ffmpeg** | Audio/video converter | MP3 encoding of voice lines; soundtrack loudness measurement, MP3/FLAC encoding, tagging; spectrograms |
| **Playwright** (pip) and its **Chromium** | Browser automation library and a matching headless Chrome | Smoke tests, screenshots, offline soundtrack rendering. It comes from PyPI, not npm. The wheel contains its own small Node.js runtime, which drives the browser internally |
| **kokoro-onnx** (pip; pulls in **onnxruntime**, **phonemizer**, **espeakng-loader**), **soundfile**, **numpy** | Kokoro text-to-speech on ONNX Runtime | Generating voice lines |
| **Kokoro model files** (`kokoro-v1.0.int8.onnx`, `voices-v1.0.bin`, ~120 MB) | The neural TTS model and its voice embeddings | Needed by kokoro-onnx; downloaded and checksummed by a script |
| **Biome** | Linter for JavaScript and CSS, one standalone binary | Correctness checks (undeclared variables, missing imports, suspicious code). Used for checking only, never for formatting |
| A desktop **browser** (Firefox, Chrome or Chromium) | — | Playing the game while developing. Chromium also enables debugging from VS Code |
| *(optional)* **VS Code** | Code editor | Tasks and launch configurations are included in `.vscode/` |
| **Claude Code** | Claude in your terminal or VS Code | Working on the project with Claude |

All Python package versions are pinned exactly in `requirements.txt`, dependencies included.

> **Not needed:** Node.js, npm, a separate web server (`tools/serve.py` uses only Python's standard library), a database, Docker, TypeScript or any framework.

---

## 1. System packages

```bash
sudo apt update
sudo apt install -y git curl python3-venv ffmpeg
sudo apt install -y chromium      # optional: debugging from VS Code (Linux Mint / Debian package)
```

Check:

```bash
python3 --version    # 3.10 – 3.13 (Ubuntu 24.04 / Mint 22: 3.12)
ffmpeg -version | head -1
```

## 2. Biome

Biome is a single executable; nothing else is installed with it.
1. Download `biome-linux-x64` from the [Biome releases page](https://github.com/biomejs/biome/releases). This project uses version 2.5.15.
2. Install it into `~/.local/bin`, which is on your `PATH` on Ubuntu and Mint (log out and in once if the folder is new):

```bash
install -m 755 ~/Downloads/biome-linux-x64 ~/.local/bin/biome
biome --version      # Version: 2.5.15
```

Its configuration is `biome.json` in the project root: lint rules only, formatter and import sorting switched off.

## 3. Project setup

```bash
cd ~/repos/AAA-Sweeper            # wherever the project lives
scripts/setup.sh
```

`scripts/setup.sh` is safe to run again at any time:
1. Checks the system packages, and tells you the `apt` line if something is missing.
2. Creates `.venv/` and installs `requirements.txt` into it.
3. Downloads Playwright's Chromium into `~/.cache/ms-playwright/`.
4. Downloads the Kokoro model files into `tools/tts/models/` and verifies their SHA-256 checksums.

Check:

```bash
scripts/bake_voices.sh --check                                            # -> OK (197 lines)
scripts/bake_voices.sh --say reyes "Sweeper, this is Overlord. Radio check."
# -> out/tts/preview.mp3, play it with any media player
```

You never need to activate the venv yourself. The scripts call `.venv/bin/python` directly.

## 4. Check that everything works

```bash
scripts/startup.sh     # -> dev server running: http://localhost:8080/
```

1. Open http://localhost:8080 in your browser and click the mine icon. The game should start.
2. Edit any file in `js/` or `css/` and press F5 in the browser to see the change. The server tells the browser not to cache anything, so a reload always picks up the current files.
3. The server keeps running in the background until you stop it with `scripts/shutdown.sh`. Running `scripts/startup.sh` again while it runs does nothing.

```bash
scripts/smoke.sh       # headless play-through of all chapters; should end with "all good"
biome lint             # should report no errors, warnings or infos
```

If all of this works, the machine is ready.

**Why a server?** The game is split into ES modules (JavaScript files that `import` each other), and browsers load modules only over `http://`. Opening `index.html` directly from disk (`file://`) shows a blank page.

## 5. VS Code

Open the project folder (*File → Open Folder*). `.vscode/` contains:

- **Tasks** (*Terminal → Run Task…*):
  - Start dev server, Stop dev server
  - Open in browser (starts the server if needed)
  - Smoke test, Smoke test (mobile)
  - Lint (Biome)
  - Bake voices, Check voices
- **Launch configurations** (*Run and Debug*, or F5 in VS Code):
  - **Play in Chromium (debugger)** starts the dev server if needed and opens Chromium with VS Code's debugger attached, so breakpoints in `js/` work.
  - **Play in Chromium with test hooks (?debug)** does the same with the test hooks (`window.testHooks`) loaded.
  - Stopping the debug session leaves the server running.
  - They expect `/usr/bin/chromium`; for Google Chrome, change `runtimeExecutable` in `launch.json`.
- **Settings:**
  - `reference/` (a 6 MB single-file copy of the game), `.venv/` and `out/` are excluded from search.
  - Format-on-save is off, because the code is intentionally compact and must not be reformatted.
- **Recommended extension:** *Biome* (`biomejs.biome`) shows lint findings in the editor. It uses `biome.json`, so it never formats.

## 6. Claude Code

Claude Code requires a Claude Pro, Max, Team or Enterprise plan, or an Anthropic Console account. Install it with the official installer, or use the VS Code extension:

```bash
curl -fsSL https://claude.ai/install.sh | bash
# open a new terminal
claude --version
```

Start it **inside the project folder**:

```bash
cd ~/repos/AAA-Sweeper
claude
```

The first run opens a browser window to log in. Claude Code automatically reads `.claude/CLAUDE.md`, which explains the project, its commands and its workflow. Things you can ask:

- *"Run the smoke test and show me the Pathos-4 screenshots."*
- *"Add a seventh chapter: an orbital space station. New scenery, tileset, music theme and 15 voice lines for HALCYON and Reyes."*
- *"Generate five more lines for Mom in Mom's Backyard and wire them into her arc."*
- *"Export the soundtrack."*

Claude Code asks permission before running commands. Allowing `scripts/…`, `.venv/bin/python tools/…`, `biome lint` and `ffmpeg` for the session makes it much smoother. CLAUDE.md limits Claude to non-destructive git commands. It stages files (`git add`) only when you ask, and you commit and push yourself.

## 7. Everyday commands (cheat sheet)

| Task | Command |
|---|---|
| Start / stop the dev server (http://localhost:8080) | `scripts/startup.sh` / `scripts/shutdown.sh` |
| Headless test of everything | `scripts/smoke.sh` (`--mobile` for phone size) |
| Correctness check of JS and CSS | `biome lint` |
| Screenshot a state | `.venv/bin/python tools/browser/screenshot.py --chapter 5 --flood` |
| Voice lines | `scripts/bake_voices.sh` (missing lines), `scripts/bake_voices.sh <ids>`, `--check` |
| Soundtrack | `scripts/export_ost.sh` → `out/ost/` |
| Put the game on a web server | Copy `index.html`, `css/`, `js/`, `assets/` |

## 8. Other distributions

| | Fedora | Arch |
|---|---|---|
| System packages | `sudo dnf install git curl python3 ffmpeg` (ffmpeg needs RPM Fusion; or use `ffmpeg-free`) | `sudo pacman -S git curl python ffmpeg` |
| Python venv | Included with python3 | Included |
| Playwright's browser | `scripts/setup.sh` downloads a generic Linux build; install libraries that an error message names | Same |

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `startup.sh`: port 8080 is used by another program | Stop that program, or use another port: `PORT=8081 scripts/startup.sh` |
| Opening `index.html` directly shows a blank page | Expected (see §4). Use `scripts/startup.sh` and http://localhost:8080 |
| An edit doesn't show up | Press F5 in the browser. Check `out/server.log` and the browser console (F12) for errors |
| `no .venv: run scripts/setup.sh first` | Run `scripts/setup.sh` |
| `setup.sh`: missing system packages | Run the `sudo apt install …` line it prints |
| `browserType.launch: Executable doesn't exist` | `.venv/bin/playwright install chromium` |
| Chromium fails with a missing `lib…so` | `.venv/bin/playwright install-deps chromium` (Debian/Ubuntu; asks for sudo) |
| `Kokoro model files missing` | `scripts/setup.sh` (or `bash tools/tts/download_models.sh`) |
| `ffmpeg: command not found` | `sudo apt install ffmpeg` |
| `biome: command not found` | Check that `~/.local/bin` is on `PATH` (log out and in), see §2 |
| No sound in the game | Browsers start audio only after a click. Click the desktop icon or the board. Check the in-game mute (M) and the settings |
| Testing on a phone | `scripts/shutdown.sh`, then `HOST=0.0.0.0 scripts/startup.sh` and open `http://<this computer's IP>:8080` on a phone in the same network. Only the game files are served, but anyone on the network can load them |
