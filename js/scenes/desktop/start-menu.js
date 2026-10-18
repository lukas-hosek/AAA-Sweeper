/**
 * start-menu.js: the Start menu of the fake desktop.
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {FindElement} from '../../core/dom.js';


/** Three entries: launch the game, the patch notes, and a shutdown screen that a click dismisses. */
export class StartMenu {
	#desktop;                       // The DesktopScene it opens on
	#element = null;                // The open menu, or null


	constructor(desktop) {
		this.#desktop = desktop;
	}


	get isOpen() {
		return this.#element !== null;
	}


	Toggle() {
		if (this.isOpen) {
			this.Close();
		} else {
			this.#Open();
		}
	}


	Close() {
		if (this.#element) {
			this.#element.remove();
		}
		this.#element = null;
		FindElement('#start-button').classList.remove('is-pressed');
	}


	#Open() {
		FindElement('#start-button').classList.add('is-pressed');
		const menu = document.createElement('div');
		this.#element = menu;
		menu.id = 'start-menu';
		menu.className = 'w98-window';
		menu.style.zIndex = String(this.#desktop.NextLayer());
		const item = (action, icon, label) =>
			`<li><button data-start-item="${action}"><svg><use href="assets/icons.svg#${icon}"/></svg>${label}</button></li>`;
		menu.innerHTML = '<div class="start-menu-banner"><b>Sweep</b>OS 98</div><ul>'
			+ item('play', 'icon-mine', 'Triple A Sweeper') + item('notes', 'icon-notepad', 'Patch Notes') + '<li><hr></li>'
			+ item('off', 'icon-computer', 'Shut Down...') + '</ul>';
		this.#desktop.element.appendChild(menu);
		menu.style.left = '2px';
		menu.style.top = 'auto';
		menu.addEventListener('click', event => this.#OnClick(event));
	}


	#OnClick(event) {
		const button = event.target.closest('button');
		if (!button) {
			return;
		}
		this.Close();
		const action = button.dataset.startItem;
		if (action === 'play') {
			audioEngine.Init();
			this.#desktop.Launch();
		} else if (action === 'notes') {
			this.#desktop.OpenItem('notes');
		} else {
			this.#ShowShutdownScreen();
		}
	}


	#ShowShutdownScreen() {
		const screen = document.createElement('div');
		screen.id = 'shutdown-screen';
		screen.innerHTML = 'It’s now safe to turn off<br>your computer.';
		this.#desktop.element.appendChild(screen);
		screen.addEventListener('click', () => screen.remove());
	}
}
