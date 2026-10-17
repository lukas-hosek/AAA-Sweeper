# Setting up your Linux machine

This guide assumes a fresh **Ubuntu 24.04 or Debian 12** desktop with nothing web-related installed. Other distributions work too; package names for Fedora and Arch are in §8. It covers everything needed for you **and for Claude Code** to do every task in this project:
- run the game
- edit it with live reload
- build the single-file version
- run headless browser tests and screenshots
- generate voice lines with TTS
- export the soundtrack

Expect about 15 minutes and roughly 2 GB of disk space (Chromium for Playwright, Node packages, the Python TTS stack and its model).

## What you will install, and why

| Tool | What it is | Why this project needs it |
|---|---|---|
| **git** | Version control | Track changes; Claude Code works best in a git repo |
| **curl**, **ca-certificates** | Download tool and TLS certificates | Installers, model download |
| **zip / unzip** | Archives | Unpacking this project; soundtrack zips |
| **Node.js 24 LTS** (via **nvm**) | JavaScript runtime outside the browser | Runs the dev server, build and test tools. Ubuntu's own `nodejs` package is too old (v18) |
| **npm** | Node's package manager (comes with Node) | Installs the three project dependencies |
| **Vite** (npm package) | Development web server and bundler | `npm run dev`: serves the game with live reload; `npm run build:site` |
| **esbuild** (npm package) | Very fast JavaScript bundler | `npm run build`: bundles all modules into the single HTML file |
| **Playwright** (npm package) and its **Chromium** | Browser automation library and a matching headless Chrome | Smoke tests, screenshots, offline soundtrack rendering |
| **Python 3.10–3.13** with **venv** and **pip** | Python runtime, isolated environments, package manager | The TTS voice generator |
| **kokoro-onnx** (pip; pulls in **onnxruntime**, **phonemizer**, **espeakng-loader**), **soundfile**, **numpy** | Kokoro text-to-speech on ONNX Runtime | Generating voice lines |
| **Kokoro model files** (`kokoro-v1.0.int8.onnx`, `voices-v1.0.bin`, ~120 MB) | The neural TTS model and its voice embeddings | Needed by kokoro-onnx; downloaded by a script |
| **ffmpeg** | Audio/video converter | MP3 encoding of voice lines; soundtrack loudness measurement, MP3/FLAC encoding, tagging; spectrograms |
| **Claude Code** | Claude in your terminal | Working on the project with Claude |
| A desktop **browser** (Firefox, Chrome or Chromium) | — | Playing the game while developing |
| *(optional)* **VS Code** or any editor | Code editor | Reading and editing the source |
| *(optional)* **Pillow** (pip) | Python imaging library | Contact sheets or crops of screenshots (Claude used it while building this) |

> **Not needed:** a web server (Vite is the server), a database, Docker, TypeScript, React or any framework. The game has no runtime dependencies.

---

## 1. System packages

```bash
sudo apt update
sudo apt install -y git curl ca-certificates zip unzip python3 python3-venv python3-pip ffmpeg
```

Check:

```bash
git --version        # any recent version
python3 --version    # 3.10 – 3.13 (Ubuntu 24.04: 3.12)
ffmpeg -version | head -1
```

## 2. Node.js (via nvm)

nvm ("Node Version Manager") installs Node.js in your home directory, with no `sudo` needed, and lets you switch versions later.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
# close the terminal and open a new one (or: source ~/.bashrc), then:
nvm install 24
nvm alias default 24
```

Check:

```bash
node -v    # v24.x  (anything >= 22.12 works)
npm -v     # 10.x or 11.x
```

(If v0.40.8 is no longer current, check the latest release at https://github.com/nvm-sh/nvm. Any recent version is fine.)

## 3. Unpack the project and install its packages

```bash
mkdir -p ~/projects && cd ~/projects
unzip ~/Downloads/triple-a-sweeper.zip      # adjust the path to where you saved it
cd triple-a-sweeper
git init && git add -A && git commit -m "Triple A Sweeper workspace"   # recommended

npm install                                  # installs vite, esbuild, playwright into node_modules/
npx playwright install --with-deps chromium  # downloads Playwright's Chromium + system libraries (asks for sudo)
```

`--with-deps` installs the shared libraries headless Chromium needs (fonts, graphics and audio libraries) through apt. If you prefer not to give it sudo, run `npx playwright install chromium` and install missing libraries manually when an error names them.

## 4. Python environment for the voice generator

A virtual environment (`.venv`) keeps the TTS packages separate from the system Python.

```bash
cd ~/projects/triple-a-sweeper
python3 -m venv .venv
source .venv/bin/activate          # your prompt now starts with (.venv)
pip install -r tools/tts/requirements.txt
bash tools/tts/download_models.sh  # ~120 MB into tools/tts/models/, checksums verified
```

Check:

```bash
python3 tools/tts/generate_voices.py --check                 # -> OK (197 lines)
python3 tools/tts/generate_voices.py --say reyes "Sweeper, this is Overlord. Radio check."
# -> out/tts/preview.mp3, play it with any media player
```

**Remember:** run `source .venv/bin/activate` in each new terminal before running voice tools. You can tell Claude Code to do the same: it is in CLAUDE.md.

## 5. Check that everything works

```bash
npm run dev
```

Open the address it prints (http://localhost:5173) in your browser. Click the mine icon and the game should start. Edit any file in `js/` or `css/` and the page reloads. Stop the server with Ctrl+C.

```bash
npm run smoke          # headless play-through of all chapters; should end with "all good"
npm run build          # -> dist/triple-a-sweeper.html (one 6 MB file that runs by double-clicking)
xdg-open dist/triple-a-sweeper.html
```

If all three work, the machine is ready.

## 6. Claude Code

Claude Code requires a Claude Pro, Max, Team or Enterprise plan, or an Anthropic Console account. Install it with the official installer:

```bash
curl -fsSL https://claude.ai/install.sh | bash
# open a new terminal
claude --version
claude doctor          # optional: diagnostics
```

(Alternatives: Anthropic's apt/dnf repositories, or `npm install -g @anthropic-ai/claude-code`. Never use `sudo npm`. See https://code.claude.com/docs/en/setup.)

Start it **inside the project folder**:

```bash
cd ~/projects/triple-a-sweeper
claude
```

The first run opens a browser window to log in. Claude Code automatically reads `.claude/CLAUDE.md`, which explains the project, its commands and its workflow. Type `/context` to see that it loaded. Things you can ask:

- *"Run the smoke test and show me the Pathos-4 screenshots."*
- *"Add a seventh chapter: an orbital space station. New scenery, tileset, music theme and 15 voice lines for HALCYON and Reyes."*
- *"Generate five more lines for Mom in Mom's Backyard and wire them into her arc."*
- *"Export the soundtrack."*
- *"Build the single-file version."*

Claude Code asks permission before running commands. Allowing `npm run …`, `node tools/…`, `python3 tools/…` and `ffmpeg` for the session makes it much smoother.

## 7. Everyday commands (cheat sheet)

| Task | Command |
|---|---|
| Develop with live reload | `npm run dev` |
| Headless test of everything | `npm run smoke` (`-- --mobile` for phone size) |
| Screenshot a state | `node tools/browser/screenshot.mjs --chapter 5 --flood` |
| Single-file build | `npm run build` → `dist/triple-a-sweeper.html` |
| Multi-file website build | `npm run build:site` → `dist/site/` |
| Voice lines | `source .venv/bin/activate`, then `python3 tools/tts/generate_voices.py <ids>` |
| Soundtrack | `npm run ost:cover && npm run ost` (plain Python + ffmpeg; no venv needed) |

## 8. Other distributions

| | Fedora | Arch |
|---|---|---|
| System packages | `sudo dnf install git curl zip unzip python3 python3-pip ffmpeg` (ffmpeg needs RPM Fusion; or use `ffmpeg-free`) | `sudo pacman -S git curl zip unzip python python-pip ffmpeg` |
| Python venv | Included with python3 | Included |
| Node.js | nvm, as above | nvm, or `sudo pacman -S nodejs npm` (Arch is current) |
| Playwright browser deps | `npx playwright install chromium`, then install libraries it reports | Same |

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `npm run dev` says the Node version is unsupported | `node -v` must be ≥ 22.12. Run `nvm use 24` (or `nvm alias default 24`) |
| Opening `index.html` directly shows a blank or broken page | Expected. The source uses ES modules, which need a server. Use `npm run dev`, or open the built `dist/triple-a-sweeper.html` |
| `browserType.launch: Executable doesn't exist` | Run `npx playwright install chromium` |
| Chromium fails with missing `lib…so` | Run `npx playwright install-deps chromium` (uses sudo) |
| `ModuleNotFoundError: kokoro_onnx` | Activate the venv: `source .venv/bin/activate` |
| `Kokoro model files missing` | `bash tools/tts/download_models.sh` |
| `ffmpeg: command not found` | `sudo apt install ffmpeg` |
| No sound in the game | Browsers start audio only after a click. Click the desktop icon or the board. Check the in-game mute (M) and the settings |
| Port 5173 is busy | Vite picks the next free port automatically and prints it |
| The single-file build shows plain fonts | It loads the fonts from Google Fonts, so you need to be online. The dev server uses the bundled copies |

## 10. Tools Claude used while building the original

For reference, these are the tools behind each part of the original single-file version, and their counterparts in this workspace:

| Tool | Then | Now |
|---|---|---|
| Python 3 + kokoro-onnx + ffmpeg | Voice lines → base64 JSON → embedded in the HTML | `tools/tts/` → `public/voices/*.mp3` |
| Python Playwright + headless Chrome | Ad-hoc test and screenshot scripts | Node Playwright: `tools/browser/` |
| Pillow (Python) | Cropping and contact sheets to inspect screenshots | Optional; any image tool |
| ffmpeg (`ebur128`, `showspectrumpic`, `libmp3lame`, `flac`) | Soundtrack loudness, inspection, encoding | `tools/ost/encode_ost.py` |
| OfflineAudioContext (in the browser) | Rendering the music to WAV | `js/debug.js` (`window.__render`) + `tools/ost/render-ost.mjs` |
| npm (`npm pack @fontsource/*`) | Fetching font files for offline screenshots | `assets/fonts/` (already included) |
| zip, sha256sum, base64 | Packaging, verification | Same |
| Babel parser + magic-string (Node) | Splitting the single file into modules | `tools/legacy/migration/` (reference only) |

The original scripts are kept in `tools/legacy/` (see its README). They contain absolute paths from the build machine and are not meant to be run.
