/**
 * scenery.js: the base class of the chapter backgrounds.
 */
import {Clamp} from '../../core/math.js';
import {random} from '../../core/random.js';
import {layout} from '../layout.js';


const FOG_TEXTURE_WIDTH = 1024;
const FOG_TEXTURE_HEIGHT = 256;


/**
 * A procedural backdrop behind the board. Prepare() bakes the static parts once per size into an offscreen canvas
 * (Build); Draw() paints that bake every frame and animates the rest (embers, fog, birds, lights, water...).
 * Sizes are CSS pixels; bakes are painted at the device pixel ratio.
 */
export class Scenery {
	width = 0;           // Size the scenery was built for
	height = 0;
	baked = null;        // The static parts, painted once
	particles = [];      // The scenery's animated bits

	static #fogTexture = null;    // Soft fog puffs, shared by every scenery and built once


	/** Builds the scenery for a size (and the shared fog texture, the first time). */
	Prepare(width, height) {
		this.width = width;
		this.height = height;
		this.particles = [];
		if (!Scenery.#fogTexture) {
			Scenery.#fogTexture = this.#PaintFogTexture();
		}
		this.Build(width, height);
	}


	/** Bakes the static parts and creates the particles. Overridden by every scenery. */
	Build(width, height) {
	}


	/** Paints one frame. Overridden by every scenery. */
	Draw(context, width, height, time, deltaTime) {
	}


	/** An offscreen canvas of the given CSS size at the device pixel ratio, painted by paint(context). */
	Bake(width, height, paint) {
		const pixelRatio = layout.viewport.pixelRatio;
		const canvas = document.createElement('canvas');
		canvas.width = Math.ceil(width * pixelRatio);
		canvas.height = Math.ceil(height * pixelRatio);
		const context = canvas.getContext('2d');
		context.scale(pixelRatio, pixelRatio);
		paint(context);
		return canvas;
	}


	/** A filled jagged skyline (ruins, ridges) wandering around `base` by up to `amplitude` per `step`. */
	DrawJaggedRidge(context, width, height, base, amplitude, step, color) {
		context.fillStyle = color;
		context.beginPath();
		context.moveTo(0, height);
		let y = base;
		for (let x = 0; x <= width + step; x += step) {
			y = Clamp(y + random.Range(-amplitude, amplitude), base - amplitude * 3, base + amplitude * 2);
			context.lineTo(x, y);
		}
		context.lineTo(width, height);
		context.closePath();
		context.fill();
	}


	/** Two layers of fog drifting at different speeds in a horizontal band. */
	DrawFog(context, width, time, y, bandHeight, alpha) {
		const fog = Scenery.#fogTexture;
		const textureWidth = Math.max(width, FOG_TEXTURE_WIDTH);
		const offsetNear = (time * 14) % textureWidth;
		const offsetFar = (time * 7) % textureWidth;
		context.globalAlpha = alpha;
		for (let x = -offsetNear; x < width; x += textureWidth) {
			context.drawImage(fog, x, y, textureWidth, bandHeight);
		}
		context.globalAlpha = alpha * 0.7;
		for (let x = offsetFar - textureWidth; x < width; x += textureWidth) {
			context.drawImage(fog, x, y + bandHeight * 0.38, textureWidth, bandHeight * 0.8);
		}
		context.globalAlpha = 1;
	}


	/** A sun with an anamorphic streak and lens ghosts towards the screen centre. `strength` scales it all. */
	DrawSunFlare(context, width, height, sunX, sunY, strength, isWarm) {
		context.globalCompositeOperation = 'lighter';
		let gradient = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, 70 * strength);
		gradient.addColorStop(0, `rgba(255,245,220,${0.9 * strength})`);
		gradient.addColorStop(0.25, isWarm ? 'rgba(255,190,120,.35)' : 'rgba(255,245,215,.32)');
		gradient.addColorStop(1, 'rgba(255,150,80,0)');
		context.fillStyle = gradient;
		context.fillRect(sunX - 70 * strength, sunY - 70 * strength, 140 * strength, 140 * strength);

		// The horizontal streak: a radial gradient squashed flat
		context.save();
		context.translate(sunX, sunY);
		context.scale(1, 0.022);
		gradient = context.createRadialGradient(0, 0, 0, 0, 0, width * 0.62);
		gradient.addColorStop(0, `rgba(140,200,255,${0.5 * strength})`);
		gradient.addColorStop(1, 'rgba(80,140,255,0)');
		context.fillStyle = gradient;
		context.fillRect(-width * 0.62, -width * 0.62, width * 1.24, width * 1.24);
		context.restore();

		// Ghosts along the line from the sun through the screen centre
		const towardsCenterX = width / 2 - sunX;
		const towardsCenterY = height / 2 - sunY;
		/** @type {Array<[number, number, string]>} [distance along the line, radius, RGB] */
		const ghosts = [[0.35, 26, '120,170,255'], [0.72, 14, '255,180,120'], [1.18, 46, '120,255,200'], [1.55, 22, '190,140,255']];
		for (const [distance, radius, color] of ghosts) {
			const x = sunX + towardsCenterX * distance;
			const y = sunY + towardsCenterY * distance;
			gradient = context.createRadialGradient(x, y, 0, x, y, radius);
			gradient.addColorStop(0, `rgba(${color},${0.07 * strength})`);
			gradient.addColorStop(0.7, `rgba(${color},${0.05 * strength})`);
			gradient.addColorStop(1, `rgba(${color},0)`);
			context.fillStyle = gradient;
			context.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
		}
		context.globalCompositeOperation = 'source-over';
	}


	/** A distant bird: a "V" whose wing tips rise and fall with `flap`. */
	DrawBirdV(context, x, y, flap) {
		context.beginPath();
		context.moveTo(x - 7, y - flap);
		context.quadraticCurveTo(x - 3, y - 2, x, y);
		context.quadraticCurveTo(x + 3, y - 2, x + 7, y - flap);
		context.stroke();
	}


	/** 80 soft puffs, repeated left and right so the texture tiles horizontally. */
	#PaintFogTexture() {
		const canvas = document.createElement('canvas');
		canvas.width = FOG_TEXTURE_WIDTH;
		canvas.height = FOG_TEXTURE_HEIGHT;
		const context = canvas.getContext('2d');
		for (let k = 0; k < 80; k++) {
			const x = random.Range(0, FOG_TEXTURE_WIDTH);
			const y = random.Range(60, 200);
			const radius = random.Range(40, 130);
			for (const repeat of [-FOG_TEXTURE_WIDTH, 0, FOG_TEXTURE_WIDTH]) {
				const puff = context.createRadialGradient(x + repeat, y, 0, x + repeat, y, radius);
				puff.addColorStop(0, 'rgba(200,175,160,.075)');
				puff.addColorStop(1, 'rgba(200,175,160,0)');
				context.fillStyle = puff;
				context.fillRect(x + repeat - radius, y - radius, 2 * radius, 2 * radius);
			}
		}
		return canvas;
	}
}
