/**
 * steel-tileset.js: brushed steel plates (Sector B-4, and the fallback look).
 */
import {FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {Tileset} from './tileset.js';


/** Brushed metal plates with a soft highlight, and rivets once the tiles are big enough to show them. */
export class SteelTileset extends Tileset {
	constructor() {
		super(['#323b43', '#14191e'], '#596570');
	}


	DrawHidden(size, isHovered) {
		const {canvas, context} = this.CreateTileCanvas(size);
		const bevel = Math.max(1, Math.round(size * 0.1));
		this.FillGradient(context, size, [0, 0, size, size], [
			[0, isHovered ? '#c6d2db' : '#a6b2bc'],
			[0.55, isHovered ? '#97a6b1' : '#7d8a94'],
			[1, isHovered ? '#6f7c86' : '#56616a'],
		]);
		// Brushed: every pixel row slightly lighter by a random amount
		for (let y = 0; y < size; y++) {
			context.fillStyle = `rgba(255,255,255,${random.Next() * 0.05})`;
			context.fillRect(0, y, size, 1);
		}
		this.DrawBevel(context, size, bevel, 'rgba(255,255,255,.55)', 'rgba(8,14,20,.62)');
		const sheen = context.createRadialGradient(size * 0.3, size * 0.25, 0, size * 0.3, size * 0.25, size * 0.75);
		sheen.addColorStop(0, 'rgba(255,255,255,.38)');
		sheen.addColorStop(1, 'rgba(255,255,255,0)');
		context.fillStyle = sheen;
		context.fillRect(bevel, bevel, size - 2 * bevel, size - 2 * bevel);
		if (size >= 44) {
			context.fillStyle = 'rgba(0,0,0,.35)';
			const inset = bevel * 2;
			for (const [x, y] of [[inset, inset], [size - inset, inset], [inset, size - inset], [size - inset, size - inset]]) {
				context.beginPath();
				context.arc(x, y, size * 0.03, 0, FULL_TURN);
				context.fill();
			}
		}
		this.DrawOutline(context, size, 'rgba(0,0,0,.6)');
		return canvas;
	}


	DrawOpen(size) {
		const {canvas, context} = this.CreateTileCanvas(size);
		this.FillGradient(context, size, [0, 0, size, size], [[0, '#1f2830'], [1, '#12181d']]);
		this.DrawSunkenEdges(context, size, 'rgba(0,0,0,.55)', 'rgba(255,255,255,.06)');
		return canvas;
	}
}
