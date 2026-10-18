/**
 * desktop-window.js: one draggable window on the fake desktop.
 */
import {EscapeHtml} from '../../core/dom.js';
import {Clamp} from '../../core/math.js';
import {random} from '../../core/random.js';


const KEEP_VISIBLE = 60;            // Dragging always leaves this much of the window on screen (CSS pixels)
const TASKBAR_HEIGHT = 30;


/** A window with a title bar, a close button and a body. It opens near the centre, a little off each time. */
export class DesktopWindow {
	element;                        // The .w98-window element
	title;                          // Title bar text, also on its taskbar button
	icon;                           // Icon id in assets/icons.svg, or '' for none
	#desktop;                       // The DesktopScene it lives on


	/** Opens the window on the desktop. `width` is a CSS width, '' for the content's width. */
	constructor(desktop, title, icon, bodyHtml, className = '', width = '') {
		this.#desktop = desktop;
		this.title = title;
		this.icon = icon || '';
		const element = document.createElement('div');
		this.element = element;
		element.className = 'w98-window ' + className;
		element.setAttribute('role', 'dialog');
		element.style.zIndex = String(desktop.NextLayer());
		if (width) {
			element.style.width = width;
		}
		const iconMarkup = icon ? `<svg><use href="assets/icons.svg#${icon}"/></svg>` : '';
		element.innerHTML = `<div class="w98-title-bar">${iconMarkup}<span>${EscapeHtml(title)}</span>`
			+ `<button class="w98-button close-button" aria-label="Close">×</button></div>${bodyHtml}`;
		desktop.element.appendChild(element);
		const rect = element.getBoundingClientRect();
		element.style.left = Math.max(8, (innerWidth - rect.width) / 2 + random.Range(-30, 30)) + 'px';
		element.style.top = Math.max(8, (innerHeight - TASKBAR_HEIGHT - rect.height) / 2.4 + random.Range(-20, 20)) + 'px';
		element.addEventListener('pointerdown', () => this.BringToFront());
		this.#MakeDraggable(element.querySelector('.w98-title-bar'));
		element.querySelector('.close-button').addEventListener('click', () => this.Close());
	}


	BringToFront() {
		this.element.style.zIndex = String(this.#desktop.NextLayer());
	}


	/** Puts the window at the centre of the screen (the launcher). */
	Center() {
		const rect = this.element.getBoundingClientRect();
		this.element.style.left = (innerWidth - rect.width) / 2 + 'px';
		this.element.style.top = Math.max(8, (innerHeight - TASKBAR_HEIGHT - rect.height) / 2) + 'px';
	}


	Close() {
		this.element.remove();
		this.#desktop.OnWindowClosed(this);
	}


	/** Dragging the title bar (not its button) moves the window. */
	#MakeDraggable(titleBar) {
		titleBar.addEventListener('pointerdown', event => {
			if (event.target.closest('button')) {
				return;
			}
			const startX = event.clientX;
			const startY = event.clientY;
			const startLeft = this.element.offsetLeft;
			const startTop = this.element.offsetTop;
			// Keep receiving the moves even when the pointer outruns the title bar
			titleBar.setPointerCapture(event.pointerId);
			const move = moveEvent => {
				const leftmost = -this.element.offsetWidth + KEEP_VISIBLE;
				const left = Clamp(startLeft + moveEvent.clientX - startX, leftmost, innerWidth - KEEP_VISIBLE);
				this.element.style.left = left + 'px';
				this.element.style.top = Clamp(startTop + moveEvent.clientY - startY, 0, innerHeight - KEEP_VISIBLE) + 'px';
			};
			const release = () => {
				titleBar.removeEventListener('pointermove', move);
				titleBar.removeEventListener('pointerup', release);
			};
			titleBar.addEventListener('pointermove', move);
			titleBar.addEventListener('pointerup', release);
		});
	}
}
