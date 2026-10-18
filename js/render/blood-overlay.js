/**
 * blood-overlay.js: the damage overlay: blood splats with running drips, and arcs showing where a hit came from.
 */
import {FindElement} from '../core/dom.js';
import {Clamp, FULL_TURN} from '../core/math.js';
import {random} from '../core/random.js';
import {settings} from '../core/settings.js';
import {NowSeconds} from '../core/time.js';
import {game} from '../game/game.js';
import {layout} from './layout.js';


const MAX_SPLATS = 18;
const HIT_ARC_SECONDS = 1.8;


/** One blood splat, painted once into its own canvas at creation. Its drips keep running when drawn. */
class BloodSplat {
	x;              // Centre on screen (CSS pixels)
	y;
	radius;
	imageSize;      // Edge of the splat image
	image;          // The painted splat
	drips = [];     // {offsetX, length, maxLength, speed, width}


	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.imageSize = Math.ceil(radius * 4.4);
		this.image = this.#Paint();
		const dripCount = 1 + Math.floor(random.Next() * 3);
		for (let k = 0; k < dripCount; k++) {
			this.drips.push({
				offsetX: random.Range(-radius * 0.6, radius * 0.6),
				length: 0,
				maxLength: random.Range(radius * 0.8, radius * 3.2),
				speed: random.Range(10, 34),
				width: random.Range(radius * 0.07, radius * 0.15),
			});
		}
	}


	/** Draws the splat and grows its drips (they slow down as they lengthen). */
	Draw(context, deltaTime) {
		context.drawImage(this.image, this.x - this.imageSize / 2, this.y - this.imageSize / 2, this.imageSize, this.imageSize);
		context.fillStyle = 'rgba(88,0,0,.92)';
		for (const drip of this.drips) {
			if (drip.length < drip.maxLength) {
				drip.length = Math.min(drip.maxLength, drip.length + drip.speed * deltaTime * (1 - drip.length / drip.maxLength * 0.7));
			}
			const x = this.x + drip.offsetX;
			const y = this.y + this.radius * 0.4;
			context.fillRect(x - drip.width / 2, y, drip.width, drip.length);
			context.beginPath();
			context.arc(x, y + drip.length, drip.width * 0.75, 0, FULL_TURN);
			context.fill();
		}
	}


	/** Streaks, a wobbly blob, a darker core, flecks around it and a wet highlight. */
	#Paint() {
		const radius = this.radius;
		const size = this.imageSize;
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const context = canvas.getContext('2d');
		const center = size / 2;
		context.fillStyle = 'rgba(92,0,0,.9)';
		const streaks = 4 + Math.floor(random.Next() * 6);
		for (let k = 0; k < streaks; k++) {
			const angle = random.Range(0, FULL_TURN);
			const length = random.Range(radius * 0.9, radius * 2);
			const width = random.Range(radius * 0.06, radius * 0.16);
			context.save();
			context.translate(center, center);
			context.rotate(angle);
			context.beginPath();
			context.ellipse(length * 0.55, 0, length * 0.55, width, 0, 0, FULL_TURN);
			context.fill();
			context.restore();
		}
		const highlight = center - radius * 0.2;
		const body = context.createRadialGradient(highlight, highlight, radius * 0.1, center, center, radius * 1.15);
		body.addColorStop(0, 'rgba(140,8,8,.96)');
		body.addColorStop(0.7, 'rgba(98,0,0,.96)');
		body.addColorStop(1, 'rgba(58,0,0,.96)');
		context.fillStyle = body;
		this.#FillBlob(context, center, center, radius, 18, 0.28);
		context.fillStyle = 'rgba(120,4,4,.9)';
		this.#FillBlob(context, center + radius * 0.1, center + radius * 0.05, radius * 0.55, 12, 0.3);
		context.fillStyle = 'rgba(100,0,0,.92)';
		const flecks = 8 + Math.floor(random.Next() * 10);
		for (let k = 0; k < flecks; k++) {
			const angle = random.Range(0, FULL_TURN);
			const distance = random.Range(radius * 1.05, radius * 2);
			const fleckRadius = random.Range(radius * 0.03, radius * 0.14);
			context.beginPath();
			context.arc(center + Math.cos(angle) * distance, center + Math.sin(angle) * distance, fleckRadius, 0, FULL_TURN);
			context.fill();
		}
		context.fillStyle = 'rgba(255,190,190,.11)';
		context.beginPath();
		context.ellipse(center - radius * 0.3, center - radius * 0.35, radius * 0.35, radius * 0.16, -0.5, 0, FULL_TURN);
		context.fill();
		return canvas;
	}


	/** A roughly round blob: `points` points around a circle, each radius jittered by up to ±`jitter`. */
	#FillBlob(context, centerX, centerY, radius, points, jitter) {
		context.beginPath();
		for (let k = 0; k <= points; k++) {
			const angle = k / points * FULL_TURN;
			const pointRadius = radius * (1 + random.Range(-jitter, jitter));
			const x = centerX + Math.cos(angle) * pointRadius;
			const y = centerY + Math.sin(angle) * pointRadius;
			if (k) {
				context.lineTo(x, y);
			} else {
				context.moveTo(x, y);
			}
		}
		context.closePath();
		context.fill();
	}
}


/**
 * Blood splats near the screen edges after a mine hit, fading out as health regenerates (the "blood" setting turns
 * them off), and a red arc on the side the hit came from.
 */
export class BloodOverlay {
	#splats = [];         // BloodSplat objects, oldest first
	#hitArcs = [];        // {angle, time}: direction of a hit seen from the screen centre
	#isActive = false;    // Something to draw (cleared once health is full again)


	/** Splatters the screen after a hit at screen position (hitX, hitY). */
	Hit(hitX, hitY) {
		if (!settings.blood) {
			return;
		}
		const viewport = layout.viewport;
		const shortSide = Math.min(viewport.width, viewport.height);
		const edgeSplats = 4 + Math.floor(random.Next() * 4);
		for (let k = 0; k < edgeSplats; k++) {
			const side = Math.floor(random.Next() * 4);
			const inset = random.Range(-0.04, 0.16) * shortSide;
			let x;
			let y;
			if (side === 0) {
				x = random.Range(0, viewport.width);
				y = inset;
			} else if (side === 1) {
				x = viewport.width - inset;
				y = random.Range(0, viewport.height);
			} else if (side === 2) {
				x = random.Range(0, viewport.width);
				y = viewport.height - inset;
			} else {
				x = inset;
				y = random.Range(0, viewport.height);
			}
			this.#splats.push(new BloodSplat(x, y, random.Range(0.045, 0.11) * shortSide));
		}
		if (random.Next() < 0.7) {
			const x = random.Range(viewport.width * 0.25, viewport.width * 0.75);
			const y = random.Range(viewport.height * 0.2, viewport.height * 0.8);
			this.#splats.push(new BloodSplat(x, y, random.Range(0.025, 0.05) * shortSide));
		}
		while (this.#splats.length > MAX_SPLATS) {
			this.#splats.shift();
		}
		this.#hitArcs.push({angle: Math.atan2(hitY - viewport.height / 2, hitX - viewport.width / 2), time: NowSeconds()});
		this.#isActive = true;
	}


	/** Removes all blood at once (new field, or blood switched off). */
	Clear() {
		this.#splats.length = 0;
		this.#hitArcs.length = 0;
		this.#isActive = false;
	}


	/** Draws the overlay canvas; more opaque the lower the health, solid while dead. */
	Draw(deltaTime) {
		const field = game.field;
		if (!this.#isActive || !field) {
			return;
		}
		const canvas = FindElement('#blood-canvas');
		const context = canvas.getContext('2d');
		const viewport = layout.viewport;
		context.setTransform(viewport.pixelRatio, 0, 0, viewport.pixelRatio, 0, 0);
		context.clearRect(0, 0, viewport.width, viewport.height);
		if (field.health >= 99.5 && !this.#hitArcs.length && !field.isDead) {
			this.#splats.length = 0;
			this.#isActive = false;
			canvas.style.opacity = 0;
			return;
		}
		canvas.style.opacity = 1;
		context.globalAlpha = field.isDead ? 1 : Clamp((100 - field.health) / 50, 0, 1);
		for (const splat of this.#splats) {
			splat.Draw(context, deltaTime);
		}
		context.globalAlpha = 1;
		const now = NowSeconds();
		const shortSide = Math.min(viewport.width, viewport.height);
		this.#hitArcs = this.#hitArcs.filter(arc => now - arc.time < HIT_ARC_SECONDS);
		for (const arc of this.#hitArcs) {
			const alpha = 1 - (now - arc.time) / HIT_ARC_SECONDS;
			context.strokeStyle = `rgba(230,30,30,${alpha * 0.85})`;
			context.lineWidth = 12;
			context.lineCap = 'round';
			context.shadowColor = 'rgba(255,0,0,.8)';
			context.shadowBlur = 16;
			context.beginPath();
			context.arc(viewport.width / 2, viewport.height / 2, shortSide * 0.3, arc.angle - 0.32, arc.angle + 0.32);
			context.stroke();
			context.shadowBlur = 0;
		}
	}
}


export const blood = new BloodOverlay();
