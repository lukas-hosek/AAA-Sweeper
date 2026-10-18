/**
 * bulkhead-tileset.js: corroded steel bulkhead panels (Pathos-4).
 */
import {FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {Tileset} from './tileset.js';


/** Teal painted steel with rust streaks, algae along the bottom, rivets and condensation; four variants. */
export class BulkheadTileset extends Tileset {
	variantCount = 4;


	constructor() {
		super(['#3f5f63', '#14262a'], '#9fc3c0');
	}


	DrawHidden(size, isHovered) {
		const {canvas, context} = this.CreateTileCanvas(size);
		const bevel = Math.max(1, Math.round(size * 0.1));
		this.FillGradient(context, size, [0, 0, size, size], [
			[0, isHovered ? '#77a3a2' : '#5c8483'],
			[0.55, isHovered ? '#517a79' : '#3f6262'],
			[1, isHovered ? '#385857' : '#2a4444'],
		]);
		this.Speckle(context, size, size * size / 14, 'rgba(190,110,50,.35)', 'rgba(20,40,40,.3)');
		if (random.Next() < 0.6) {
			this.#DrawRustStreak(context, size);
		}
		const algae = context.createLinearGradient(0, size * 0.68, 0, size);
		algae.addColorStop(0, 'rgba(60,140,80,0)');
		algae.addColorStop(1, 'rgba(60,140,80,.5)');
		context.fillStyle = algae;
		context.fillRect(0, size * 0.68, size, size * 0.32);
		this.DrawBevel(context, size, bevel, 'rgba(200,240,235,.35)', 'rgba(5,20,22,.6)');
		const inset = bevel * 2;
		for (const [x, y] of [[inset, inset], [size - inset, inset], [inset, size - inset], [size - inset, size - inset]]) {
			context.fillStyle = 'rgba(15,30,30,.85)';
			context.beginPath();
			context.arc(x, y, Math.max(1, size * 0.045), 0, FULL_TURN);
			context.fill();
			context.fillStyle = 'rgba(220,255,250,.35)';
			context.fillRect(x - size * 0.02, y - size * 0.025, Math.max(1, size * 0.02), Math.max(1, size * 0.02));
		}
		// Condensation droplets
		for (let k = 0; k < 3; k++) {
			if (random.Next() < 0.7) {
				context.fillStyle = 'rgba(220,255,255,.35)';
				context.beginPath();
				const x = random.Range(inset, size - inset);
				const y = random.Range(inset, size - inset);
				context.ellipse(x, y, size * 0.02, size * 0.03, 0, 0, FULL_TURN);
				context.fill();
			}
		}
		this.DrawOutline(context, size, 'rgba(5,15,15,.7)');
		return canvas;
	}


	DrawOpen(size) {
		const {canvas, context} = this.CreateTileCanvas(size);
		this.FillGradient(context, size, [0, 0, size, size], [[0, '#0a2c35'], [1, '#04161c']]);
		// Diagonal deck grating
		context.strokeStyle = 'rgba(120,200,210,.08)';
		context.lineWidth = 1;
		for (let k = -size; k < size; k += Math.max(4, size / 6)) {
			context.beginPath();
			context.moveTo(k, size);
			context.lineTo(k + size, 0);
			context.stroke();
		}
		this.DrawSunkenEdges(context, size, 'rgba(0,0,0,.5)', 'rgba(140,230,240,.1)');
		return canvas;
	}


	/** A vertical rust streak fading downwards. */
	#DrawRustStreak(context, size) {
		const x = random.Range(size * 0.2, size * 0.8);
		const streak = context.createLinearGradient(0, size * 0.15, 0, size * 0.75);
		streak.addColorStop(0, 'rgba(170,90,40,.5)');
		streak.addColorStop(1, 'rgba(170,90,40,0)');
		context.fillStyle = streak;
		context.fillRect(x - size * 0.03, size * 0.15, size * 0.06, size * 0.6);
	}
}
