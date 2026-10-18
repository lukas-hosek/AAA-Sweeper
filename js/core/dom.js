/**
 * dom.js: small DOM helpers shared by every module.
 */


/** True when the player asked the system for reduced motion: fewer particles, slower ticker. */
export const PREFERS_REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;


/**
 * Returns the first element matching a CSS selector, inside `root` (default: the whole document).
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {any}
 */
export function FindElement(selector, root = document) {
	return root.querySelector(selector);
}


/**
 * Returns every element matching a CSS selector, as an array.
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {any[]}
 */
export function FindAllElements(selector, root = document) {
	return [...root.querySelectorAll(selector)];
}


/** Escapes text so it can be inserted into HTML markup. */
export function EscapeHtml(text) {
	const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'};
	return String(text).replace(/[&<>"]/g, character => entities[character]);
}


/** Moves the keyboard focus to the first button inside the element matching `selector`, if there is one. */
export function FocusFirstButton(selector) {
	const button = FindElement(selector + ' button');
	if (button) {
		button.focus();
	}
}
