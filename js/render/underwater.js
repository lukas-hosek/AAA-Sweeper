/**
 * underwater.js: the caustics and light rays over the flooded Pathos-4 board.
 */
import {FULL_TURN} from '../core/math.js';
import {layout} from './layout.js';


const CAUSTICS_SIZE = 256;     // Texture size in pixels; it tiles seamlessly
const CAUSTICS_TILE = 512;     // Drawn size of one texture tile in CSS pixels


/** Rippling light patterns (caustics) and slanted rays of light, drawn over the whole screen while flooded. */
export class UnderwaterEffects {
	#causticsTexture = null;    // Painted on first use


	/** A seamlessly tiling caustics texture: bright where three wobbling sine waves cross zero together. */
	get causticsTexture() {
		if (!this.#causticsTexture) {
			this.#causticsTexture = this.#PaintCaustics();
		}
		return this.#causticsTexture;
	}


	/** Two layers of drifting caustics plus four swaying light rays. */
	Draw(context, time) {
		const viewport = layout.viewport;
		context.save();
		context.globalCompositeOperation = 'lighter';
		const caustics = this.causticsTexture;
		context.globalAlpha = 0.07;
		for (const [offsetX, offsetY, scale] of [[time * 14, time * 9, 1], [-time * 11, time * 13, 1.3]]) {
			const tileSize = CAUSTICS_TILE * scale;
			const startX = -(((offsetX % tileSize) + tileSize) % tileSize);
			const startY = -(((offsetY % tileSize) + tileSize) % tileSize);
			for (let x = startX; x < viewport.width; x += tileSize) {
				for (let y = startY; y < viewport.height; y += tileSize) {
					context.drawImage(caustics, x, y, tileSize, tileSize);
				}
			}
		}
		context.globalAlpha = 1;
		for (let k = 0; k < 4; k++) {
			const x = viewport.width * (0.12 + 0.26 * k) + Math.sin(time * 0.2 + k) * 60;
			const ray = context.createLinearGradient(x, 0, x + viewport.width * 0.12, viewport.height);
			ray.addColorStop(0, 'rgba(160,230,255,.1)');
			ray.addColorStop(1, 'rgba(160,230,255,0)');
			context.fillStyle = ray;
			context.beginPath();
			context.moveTo(x - 30, 0);
			context.lineTo(x + 40, 0);
			context.lineTo(x + viewport.width * 0.2, viewport.height);
			context.lineTo(x + viewport.width * 0.08, viewport.height);
			context.closePath();
			context.fill();
		}
		context.restore();
	}


	/** Paints the caustics pixel by pixel. */
	#PaintCaustics() {
		const size = CAUSTICS_SIZE;
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const context = canvas.getContext('2d');
		const image = context.createImageData(size, size);
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const angleX = x / size * FULL_TURN;
				const angleY = y / size * FULL_TURN;
				const waves = Math.sin(angleX * 3 + Math.sin(angleY * 2) * 1.5)
					+ Math.sin(angleY * 3 + Math.sin(angleX * 2 + 1) * 1.5)
					+ Math.sin((angleX + angleY) * 2 + Math.sin(angleX - angleY) * 1.2);
				const brightness = Math.pow(1 - Math.min(1, Math.abs(waves) / 1.2), 4);
				const offset = (y * size + x) * 4;
				image.data[offset] = 180 * brightness;
				image.data[offset + 1] = 240 * brightness;
				image.data[offset + 2] = 255 * brightness;
				image.data[offset + 3] = 255;
			}
		}
		context.putImageData(image, 0, 0);
		return canvas;
	}
}


export const underwater = new UnderwaterEffects();
