/**
 * ice-tileset.js: blocks of sea ice (Station Nord-7), with frost glints twinkling over the hidden tiles.
 */
import {random} from '../../core/random.js';
import {TILE} from '../../game/minefield.js';
import {Tileset} from './tileset.js';


const GLINTS_PER_FRAME = 7;
const GLINTS_PER_SECOND = 3;


/** Pale blue ice with frost specks and scratches; four variants. */
export class IceTileset extends Tileset {
	variantCount = 4;


	constructor() {
		super(['#a9c6da', '#4d6b82'], '#e6f4fb');
	}


	DrawHidden(size, isHovered) {
		const {canvas, context} = this.CreateTileCanvas(size);
		const bevel = Math.max(1, Math.round(size * 0.1));
		this.FillGradient(context, size, [0, 0, size, size], [
			[0, isHovered ? '#f4fcff' : '#e0f2fb'],
			[0.5, isHovered ? '#bde0f1' : '#a6cee4'],
			[1, isHovered ? '#8ab8d4' : '#719fbf'],
		]);
		// Darker depth in the middle of the block
		const depth = context.createRadialGradient(size * 0.55, size * 0.6, size * 0.05, size * 0.5, size * 0.5, size * 0.7);
		depth.addColorStop(0, 'rgba(50,110,165,.28)');
		depth.addColorStop(1, 'rgba(50,110,165,0)');
		context.fillStyle = depth;
		context.fillRect(0, 0, size, size);
		this.Speckle(context, size, size * size / 12, 'rgba(255,255,255,.55)', 'rgba(255,255,255,.2)');
		context.strokeStyle = 'rgba(255,255,255,.6)';
		context.lineWidth = Math.max(0.6, size * 0.018);
		for (let k = 0; k < 2; k++) {
			if (random.Next() < 0.6) {
				this.#DrawScratch(context, size);
			}
		}
		this.DrawBevel(context, size, bevel, 'rgba(255,255,255,.62)', 'rgba(30,70,105,.5)');
		this.FillGradient(context, size, [0, 0, size, size], [[0, 'rgba(255,255,255,.38)'], [0.35, 'rgba(255,255,255,0)']]);
		this.DrawOutline(context, size, 'rgba(20,50,80,.55)');
		return canvas;
	}


	DrawOpen(size) {
		const {canvas, context} = this.CreateTileCanvas(size);
		this.FillGradient(context, size, [0, 0, size, size], [[0, '#143046'], [1, '#0a1a29']]);
		this.Speckle(context, size, size * size / 16, 'rgba(180,220,255,.12)', 'rgba(0,0,0,.12)');
		this.DrawSunkenEdges(context, size, 'rgba(0,0,0,.45)', 'rgba(200,235,255,.14)');
		return canvas;
	}


	/** A few sparkling crosses over hidden tiles; which tiles changes three times a second. */
	DrawBoardDecorations(context, field, board, time, now) {
		const frame = Math.floor(time * GLINTS_PER_SECOND);
		context.save();
		context.globalCompositeOperation = 'lighter';
		for (let k = 0; k < GLINTS_PER_FRAME; k++) {
			// A cheap hash picks a tile per glint and frame
			const tile = ((frame * 7919 + k * 104729) >>> 0) % field.tileCount;
			if (field.tileStates[tile] !== TILE.HIDDEN) {
				continue;
			}
			const phase = (time * GLINTS_PER_SECOND) % 1;
			const brightness = Math.sin(phase * Math.PI);
			const x = board.x + (tile % field.columns + 0.25 + ((k * 37) % 50) / 100) * board.tileSize;
			const y = board.y + (Math.floor(tile / field.columns) + 0.25 + ((k * 53) % 50) / 100) * board.tileSize;
			const radius = board.tileSize * 0.16 * brightness;
			context.strokeStyle = `rgba(255,255,255,${0.9 * brightness})`;
			context.lineWidth = 1.2;
			context.beginPath();
			context.moveTo(x - radius, y);
			context.lineTo(x + radius, y);
			context.moveTo(x, y - radius);
			context.lineTo(x, y + radius);
			context.stroke();
		}
		context.restore();
	}


	/** A thin scratch of three random segments. */
	#DrawScratch(context, size) {
		context.beginPath();
		let x = random.Range(0, size);
		let y = random.Range(0, size);
		context.moveTo(x, y);
		for (let j = 0; j < 3; j++) {
			x += random.Range(-size * 0.25, size * 0.25);
			y += random.Range(-size * 0.25, size * 0.25);
			context.lineTo(x, y);
		}
		context.stroke();
	}
}
