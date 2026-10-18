/**
 * scenery-renderer.js: draws the chapter backgrounds and the title backdrop.
 */
import {canvasFonts} from '../../core/canvas-fonts.js';
import {FindElement} from '../../core/dom.js';
import {layout} from '../layout.js';
import {BattlefieldScenery} from './battlefield-scenery.js';


/**
 * Keeps the scenery on screen built for the current size. A different scenery class, size or pixel ratio rebuilds
 * it from a fresh instance, so its random layout is drawn anew exactly as on the first build.
 */
export class SceneryRenderer {
	#current = null;            // The Scenery being shown
	#sizeKey = '';              // The size and pixel ratio it was built for
	#isMissingFonts = false;    // It was built before the canvas fonts had loaded: its signs use a fallback font


	/** Draws one frame of a scenery (by its class, e.g. a chapter's sceneryClass) filling `width` × `height`. */
	Draw(context, width, height, time, deltaTime, sceneryClass) {
		const sizeKey = width + 'x' + height + '@' + layout.viewport.pixelRatio;
		if (!this.#current || this.#current.constructor !== sceneryClass || sizeKey !== this.#sizeKey) {
			this.#sizeKey = sizeKey;
			this.#current = new sceneryClass();
			this.#current.Prepare(width, height);
			this.#isMissingFonts = !canvasFonts.areReady;
		}
		this.#current.Draw(context, width, height, time, deltaTime);
	}


	/** Rebuilds the scenery at the next frame if its baked signs had to use a fallback font. */
	OnCanvasFontsLoaded() {
		if (this.#isMissingFonts) {
			this.#current = null;
		}
	}


	/** The title screen: the battlefield under a heavy vignette. */
	DrawTitleBackdrop(time, deltaTime) {
		const canvas = FindElement('#title-canvas');
		const context = canvas.getContext('2d');
		const viewport = layout.viewport;
		context.setTransform(viewport.pixelRatio, 0, 0, viewport.pixelRatio, 0, 0);
		this.Draw(context, viewport.width, viewport.height, time, deltaTime, BattlefieldScenery);
		const centerX = viewport.width / 2;
		const centerY = viewport.height * 0.42;
		const radius = Math.max(viewport.width, viewport.height) * 0.75;
		const vignette = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
		vignette.addColorStop(0, 'rgba(0,0,0,.2)');
		vignette.addColorStop(1, 'rgba(0,0,0,.82)');
		context.fillStyle = vignette;
		context.fillRect(0, 0, viewport.width, viewport.height);
	}
}


export const scenery = new SceneryRenderer();
