/**
 * dance-floor-tileset.js: glossy glass dance floor tiles (Da Club) that pulse to the 124 BPM music.
 */
import {TILE} from '../../game/minefield.js';
import {TraceRoundedRect} from '../canvas-shapes.js';
import {Tileset} from './tileset.js';


const BEATS_PER_SECOND = 124 / 60;


/** Dark glass tiles with a gloss highlight; the lights are drawn live, on top, by DrawBoardDecorations. */
export class DanceFloorTileset extends Tileset {
	constructor() {
		super(['#1d1428', '#07040c'], null);
	}


	DrawHidden(size, isHovered) {
		const {canvas, context} = this.CreateTileCanvas(size);
		this.FillGradient(context, size, [0, 0, 0, size], [
			[0, isHovered ? '#2e2446' : '#1b1429'],
			[1, isHovered ? '#181029' : '#0a0712'],
		]);
		const inset = Math.max(1, size * 0.08);
		context.strokeStyle = 'rgba(255,255,255,.16)';
		context.lineWidth = Math.max(1, size * 0.03);
		context.strokeRect(inset, inset, size - 2 * inset, size - 2 * inset);
		const gloss = context.createLinearGradient(0, 0, size * 0.6, size * 0.6);
		gloss.addColorStop(0, 'rgba(255,255,255,.24)');
		gloss.addColorStop(0.5, 'rgba(255,255,255,.05)');
		gloss.addColorStop(1, 'rgba(255,255,255,0)');
		context.fillStyle = gloss;
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(size, 0);
		context.lineTo(0, size);
		context.closePath();
		context.fill();
		this.DrawOutline(context, size, 'rgba(0,0,0,.85)');
		return canvas;
	}


	DrawOpen(size) {
		const {canvas, context} = this.CreateTileCanvas(size);
		this.FillGradient(context, size, [0, 0, 0, size], [[0, '#150d24'], [1, '#08050f']]);
		this.DrawOutline(context, size, 'rgba(255,90,230,.12)');
		this.DrawSunkenEdges(context, size, 'rgba(0,0,0,.5)', null);
		return canvas;
	}


	/** A neon tube around the frame, cycling through the hues. */
	DrawFrameAccent(context, frameRect, cornerRadius, time) {
		context.save();
		const neonColor = `hsl(${(time * 60) % 360},100%,62%)`;
		context.strokeStyle = neonColor;
		context.lineWidth = 2;
		context.shadowColor = neonColor;
		context.shadowBlur = 16;
		TraceRoundedRect(context, frameRect.x + 3, frameRect.y + 3, frameRect.width - 6, frameRect.height - 6, cornerRadius);
		context.stroke();
		context.restore();
	}


	/** Coloured light in every tile, flashing on the beat: strong under hidden tiles, faint under revealed ones. */
	DrawBoardDecorations(context, field, board, time, now) {
		const beat = time * BEATS_PER_SECOND;
		const pulse = Math.exp(-(beat % 1) * 5);
		const inset = board.tileSize * 0.14;
		context.save();
		context.globalCompositeOperation = 'lighter';
		for (let i = 0; i < field.tileCount; i++) {
			const state = field.tileStates[i];
			const column = i % field.columns;
			const row = Math.floor(i / field.columns);
			const hue = (column * 28 + row * 46 + time * 70) % 360;
			const x = board.x + column * board.tileSize;
			const y = board.y + row * board.tileSize;
			if (state === TILE.HIDDEN || state === TILE.FLAGGED) {
				context.fillStyle = `hsla(${hue},100%,58%,${0.14 + 0.2 * pulse})`;
				context.fillRect(x + inset, y + inset, board.tileSize - 2 * inset, board.tileSize - 2 * inset);
			} else if (state === TILE.OPEN && now >= field.revealTimes[i]) {
				context.fillStyle = `hsla(${hue},100%,58%,${0.03 + 0.05 * pulse})`;
				context.fillRect(x, y, board.tileSize, board.tileSize);
			}
		}
		context.restore();
	}
}
