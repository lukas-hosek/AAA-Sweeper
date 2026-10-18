/**
 * desktop-scene.js: the fake Windows 98 desktop the game boots into: icons, windows, the Start menu, the taskbar
 * clock, and the launcher that "patches" the game before the intro.
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {music} from '../../audio/music-sequencer.js';
import {soundEffects} from '../../audio/sound-effects.js';
import {voices} from '../../audio/voice-manager.js';
import {EscapeHtml, FindAllElements, FindElement} from '../../core/dom.js';
import {random} from '../../core/random.js';
import {Sleep, Tween} from '../../core/time.js';
import {ICON_MESSAGES, PATCH_NOTES} from '../../data/desktop-text.js';
import {game} from '../../game/game.js';
import {oxygenReadout} from '../../ui/oxygen-readout.js';
import {screens} from '../../ui/screen-manager.js';
import {introScene} from '../intro-scene.js';
import {DesktopWindow} from './desktop-window.js';
import {StartMenu} from './start-menu.js';


const DOUBLE_CLICK_MS = 500;
const CLOCK_INTERVAL_MS = 10000;
const LAUNCH_DELAY_MS = 280;            // The icon shows its selection before the launcher opens
const MESSAGE_BOX_WIDTH = 'min(380px,calc(100vw - 20px))';
const LAUNCHER_WIDTH = 'min(420px,calc(100vw - 20px))';


// The launcher's steps: status line, duration, and the detail line as a function of progress 0..1
const LAUNCHER_STEPS = [
	{message: 'Checking for launcher updates…', ms: 650, detail: () => 'Updating the launcher for the launcher'},
	{
		message: 'Downloading day-one patch…',
		ms: 1700,
		detail: progress => `${(74.2 * progress).toFixed(1)} GB of 74.2 GB · ${Math.round(900 + random.Next() * 500)} MB/s`,
	},
	{message: 'Compiling shaders…', ms: 1500, detail: progress => `${Math.floor(48213 * progress).toLocaleString('en-US')} / 48,213`},
	{message: 'Installing kernel-level anti-cheat for a single-player game…', ms: 700, detail: null},
	{
		message: 'Signing in to Megalith Online™ (required)…',
		ms: 600,
		detail: progress => progress < 1 ? 'Connecting' : 'Connected. 0 friends online.',
	},
];


/**
 * Icons open on a double click (or Enter); the game's shortcut launches on a single click. Windows stack in the
 * order they were last touched, and the taskbar lists them.
 */
export class DesktopScene {
	element = FindElement('#desktop');
	#windows = [];                      // Open DesktopWindows, oldest first
	#topLayer = 10;                     // z-index of the window in front
	#startMenu = new StartMenu(this);
	#lastIconClick = {icon: null, time: 0};
	#isLaunching = false;


	/** Starts the clock and wires the icons, the Start button and clicks on the empty desktop. */
	Init() {
		this.#UpdateClock();
		setInterval(() => this.#UpdateClock(), CLOCK_INTERVAL_MS);
		this.element.addEventListener('pointerdown', event => this.#OnDesktopPointerDown(event));
		for (const icon of FindAllElements('.desktop-icons .desktop-icon')) {
			icon.addEventListener('click', () => this.#OnIconClick(icon));
			icon.addEventListener('keydown', event => {
				if (event.key === 'Enter') {
					event.preventDefault();
					this.OpenItem(icon.dataset.opens);
				}
			});
		}
		const launchIcon = FindElement('#game-launch-icon');
		launchIcon.addEventListener('click', () => {
			this.#SelectIcon(launchIcon);
			// The first click is the user gesture that allows audio
			audioEngine.Init();
			setTimeout(() => this.Launch(), LAUNCH_DELAY_MS);
		});
		FindElement('#start-button').addEventListener('click', () => this.#startMenu.Toggle());
	}


	/** The z-index for a window (or the Start menu) coming to the front. */
	NextLayer() {
		return ++this.#topLayer;
	}


	/** Opens what a desktop icon stands for: the patch notes, or a message box. */
	OpenItem(itemId) {
		if (itemId === 'notes') {
			const body = '<div class="notepad-menu"><span>File</span><span>Edit</span><span>Search</span><span>Help</span></div>'
				+ '<div class="notepad-text" tabindex="0"></div>';
			const notepad = this.#OpenWindow('PATCH_NOTES.TXT - Notepad', 'icon-notepad', body, 'notepad-window');
			notepad.element.querySelector('.notepad-text').textContent = PATCH_NOTES;
		} else if (ICON_MESSAGES[itemId]) {
			const message = ICON_MESSAGES[itemId];
			this.#ShowMessageBox(message.title, message.text, message.icon);
		}
	}


	/** The launcher: a few fake update steps with progress bars, then the intro. */
	async Launch() {
		if (this.#isLaunching) {
			return;
		}
		this.#isLaunching = true;
		this.#startMenu.Close();
		this.element.classList.add('is-busy');
		const body = '<div class="w98-body"><div class="w98-message-row"><svg><use href="assets/icons.svg#icon-mine"/></svg>'
			+ '<div><p id="launcher-message">Checking for launcher updates…</p><p class="w98-dim-text" id="launcher-detail">&nbsp;</p></div></div>'
			+ '<div class="w98-progress"><i id="launcher-progress"></i></div>'
			+ '<div class="w98-button-row"><button class="w98-button" disabled>Cancel</button></div></div>';
		const launcher = this.#OpenWindow('Triple A Sweeper Launcher', 'icon-mine', body, '', LAUNCHER_WIDTH);
		launcher.Center();
		const message = FindElement('#launcher-message');
		const detail = FindElement('#launcher-detail');
		const bar = FindElement('#launcher-progress');
		for (const step of LAUNCHER_STEPS) {
			message.textContent = step.message;
			bar.style.width = '0%';
			await Tween(step.ms, progress => {
				bar.style.width = (progress * 100) + '%';
				detail.textContent = step.detail ? step.detail(progress) : ' ';
			});
		}
		await screens.FadeTo(1, 700);
		launcher.Close();
		this.element.classList.remove('is-busy');
		this.#SelectIcon(null);
		this.#isLaunching = false;
		screens.Show('intro');
		await Sleep(200);
		screens.FadeTo(0, 10);
		introScene.Play();
	}


	/** Quits the game back to the desktop (from the title menu or the pause menu). */
	ReturnFromGame() {
		FindElement('#toast-stack').classList.remove('is-lowered');
		oxygenReadout.Hide(true);
		(async () => {
			await screens.FadeTo(1, 500);
			music.Stop();
			voices.StopAll();
			audioEngine.Unmuffle();
			screens.CloseOverlays();
			game.EndField();
			screens.Show('desktop');
			this.#SelectIcon(null);
			await screens.FadeTo(0, 500);
		})();
	}


	/** A window closed itself: drop it from the taskbar. */
	OnWindowClosed(desktopWindow) {
		this.#windows = this.#windows.filter(open => open !== desktopWindow);
		this.#RenderTaskbar();
	}


	#OpenWindow(title, icon, bodyHtml, className = '', width = '') {
		const desktopWindow = new DesktopWindow(this, title, icon, bodyHtml, className, width);
		this.#windows.push(desktopWindow);
		this.#RenderTaskbar();
		return desktopWindow;
	}


	/** A message box with an icon, `text` (markup) and OK, opened with the classic ding. */
	#ShowMessageBox(title, text, icon) {
		soundEffects.Ding();
		const body = `<div class="w98-body"><div class="w98-message-row"><svg><use href="assets/icons.svg#${icon}"/></svg><p>${text}</p></div>`
			+ '<div class="w98-button-row"><button class="w98-button ok-button">OK</button></div></div>';
		const messageBox = this.#OpenWindow(title, null, body, '', MESSAGE_BOX_WIDTH);
		const okButton = FindElement('.ok-button', messageBox.element);
		okButton.addEventListener('click', () => messageBox.Close());
		okButton.focus();
	}


	/** One pressed-in taskbar button per window; clicking one brings its window to the front. */
	#RenderTaskbar() {
		const taskbar = FindElement('#taskbar-tasks');
		taskbar.innerHTML = '';
		for (const desktopWindow of this.#windows) {
			const button = document.createElement('button');
			button.className = 'w98-button taskbar-task is-pressed';
			const icon = desktopWindow.icon ? `<svg><use href="assets/icons.svg#${desktopWindow.icon}"/></svg>` : '';
			button.innerHTML = `${icon}<span>${EscapeHtml(desktopWindow.title)}</span>`;
			button.addEventListener('click', () => desktopWindow.BringToFront());
			taskbar.appendChild(button);
		}
	}


	/** Highlights one icon (or none). */
	#SelectIcon(selected) {
		for (const icon of FindAllElements('.desktop-icon', this.element)) {
			icon.classList.toggle('is-selected', icon === selected);
		}
	}


	/** Two clicks on the same icon within DOUBLE_CLICK_MS open it. */
	#OnIconClick(icon) {
		this.#SelectIcon(icon);
		const now = performance.now();
		if (this.#lastIconClick.icon === icon && now - this.#lastIconClick.time < DOUBLE_CLICK_MS) {
			this.OpenItem(icon.dataset.opens);
			this.#lastIconClick.icon = null;
		} else {
			this.#lastIconClick = {icon, time: now};
		}
	}


	/** Clicking empty desktop deselects the icons; clicking anywhere but the Start menu closes it. */
	#OnDesktopPointerDown(event) {
		const target = event.target;
		const isOnSomething = target.closest('.desktop-icon') || target.closest('.w98-window') || target.closest('#start-menu')
			|| target.closest('.taskbar');
		if (!isOnSomething) {
			this.#SelectIcon(null);
		}
		if (!target.closest('#start-menu') && !target.closest('#start-button')) {
			this.#startMenu.Close();
		}
	}


	#UpdateClock() {
		FindElement('#taskbar-clock').textContent = new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
	}
}


export const desktopScene = new DesktopScene();
