/**
 * lawn-tileset.js: freshly mowed lawn (Mom's Backyard), with mowing stripes and a few flowers.
 */
import {FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {TILE} from '../../game/minefield.js';
import {Tileset} from './tileset.js';


const FLOWER_COLORS = ['#ffffff', '#ffd23f', '#ff8fab'];


/** Grass tiles, darker on every other column; opened tiles are dug-up soil with pebbles. */
export class LawnTileset extends Tileset {
	variantCount = 4;
	hasColumnStripes = true;


	constructor() {
		super(['#7a4e2c', '#3f2614'], '#c7a27a');
	}


	DrawHidden(size, isHovered, isDarkStripe) {
		const {canvas, context} = this.CreateTileCanvas(size);
		const bevel = Math.max(1, Math.round(size * 0.09));
		this.FillGradient(context, size, [0, 0, 0, size], [
			[0, isHovered ? '#95d65e' : isDarkStripe ? '#6aa83e' : '#7cbc4b'],
			[1, isHovered ? '#60a038' : isDarkStripe ? '#437a24' : '#4f8a2b'],
		]);
		// Blades of grass in a light and a dark shade
		for (let k = 0; k < size * 1.6; k++) {
			const x = random.Next() * size;
			const y = random.Next() * size;
			const length = random.Range(size * 0.05, size * 0.14);
			context.strokeStyle = random.Next() < 0.5 ? 'rgba(195,245,145,.32)' : 'rgba(25,65,18,.35)';
			context.lineWidth = Math.max(0.6, size * 0.015);
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x + random.Range(-1.5, 1.5), y - length);
			context.stroke();
		}
		this.DrawBevel(context, size, bevel, 'rgba(225,255,195,.35)', 'rgba(20,50,15,.5)');
		this.DrawOutline(context, size, 'rgba(15,40,10,.6)');
		return canvas;
	}


	DrawOpen(size) {
		const {canvas, context} = this.CreateTileCanvas(size);
		this.FillGradient(context, size, [0, 0, size, size], [[0, '#5a3d26'], [1, '#3a2617']]);
		this.Speckle(context, size, size * size / 9, 'rgba(255,220,180,.1)', 'rgba(0,0,0,.2)');
		for (let k = 0; k < Math.max(2, size / 10); k++) {
			context.fillStyle = random.Next() < 0.5 ? 'rgba(150,130,110,.6)' : 'rgba(110,95,80,.6)';
			context.beginPath();
			const x = random.Range(0, size);
			const y = random.Range(0, size);
			context.ellipse(x, y, Math.max(0.8, size * 0.03), Math.max(0.6, size * 0.022), random.Range(0, 3), 0, FULL_TURN);
			context.fill();
		}
		this.DrawSunkenEdges(context, size, 'rgba(20,10,5,.5)', null);
		// Grass overhanging the top edge
		context.fillStyle = 'rgba(120,190,80,.35)';
		context.fillRect(0, 0, size, Math.max(1, size * 0.03));
		return canvas;
	}


	/** Little five-petal flowers on about one hidden tile in eleven, always the same tiles. */
	DrawBoardDecorations(context, field, board, time, now) {
		for (let i = 0; i < field.tileCount; i++) {
			if (field.tileStates[i] !== TILE.HIDDEN || ((i * 40503 + 7) >>> 0) % 11) {
				continue;
			}
			const x = board.x + (i % field.columns + 0.3 + ((i * 13) % 40) / 100) * board.tileSize;
			const y = board.y + (Math.floor(i / field.columns) + 0.3 + ((i * 29) % 40) / 100) * board.tileSize;
			const radius = Math.max(1, board.tileSize * 0.045);
			context.fillStyle = FLOWER_COLORS[i % 3];
			for (let k = 0; k < 5; k++) {
				const angle = k * 1.2566;
				context.beginPath();
				context.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, radius * 0.8, 0, FULL_TURN);
				context.fill();
			}
			context.fillStyle = '#f3b81c';
			context.beginPath();
			context.arc(x, y, radius * 0.7, 0, FULL_TURN);
			context.fill();
		}
	}
}
