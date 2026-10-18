/**
 * canvas-fonts.js: the web fonts that canvas code draws with, loaded up front.
 */


// Every face canvas code uses. Size doesn't matter for loading; weight and family do.
const CANVAS_FONTS = [
	'500 16px "Chakra Petch"',
	'600 16px "Chakra Petch"',
	'700 16px "Chakra Petch"',
	'600 16px Teko',
	'700 16px Audiowide',
	'700 16px Caveat',
];


/**
 * Canvas text only uses web fonts that have already loaded; until then it silently falls back to a system font. That
 * heals itself for text drawn every frame, but not for text baked into cached canvases (tile numbers, scenery
 * signs), so the fonts are loaded at boot and the caches rebuilt if they were baked too early.
 */
export class CanvasFonts {
	/** True once every canvas font has loaded. */
	get areReady() {
		return !document.fonts || CANVAS_FONTS.every(font => document.fonts.check(font));
	}


	/** Starts loading every canvas font. Resolves when all have loaded (or failed: the fallbacks then stay). */
	Preload() {
		if (!document.fonts || !document.fonts.load) {
			return Promise.resolve();
		}
		return Promise.all(CANVAS_FONTS.map(font => document.fonts.load(font))).then(() => {}, () => {});
	}
}


export const canvasFonts = new CanvasFonts();
