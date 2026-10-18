/**
 * minimap.js: the minimap in the top right corner: the board in miniature with a radar sweep.
 */
import {FindElement} from '../../core/dom.js';
import {FULL_TURN} from '../../core/math.js';
import {game} from '../../game/game.js';
import {TILE} from '../../game/minefield.js';
import {layout} from '../layout.js';


const OPEN_NUMBER_COLOR = '#6e7f8c';    // Open tiles with a number
const OPEN_EMPTY_COLOR = '#56656f';     // Open tiles without one


/** Colours of the tiles that aren't open. */
const TILE_COLORS = {
	[TILE.HIDDEN]: '#2f3c47',
	[TILE.FLAGGED]: '#ff4d4d',
	[TILE.EXPLODED]: '#ff9a3c',
};


/**
 * One cell per tile, lore fragments as question marks (which, as the tips admit, defeats their purpose),
 * the supply drop, the quest target with a pulse, the player's arrow and a sweeping radar.
 */
export class Minimap {
	/** Draws the minimap for this frame. */
	Draw(time) {
		const canvas = FindElement('#minimap-canvas');
		const context = canvas.getContext('2d');
		const pixelRatio = layout.viewport.pixelRatio;
		const size = canvas.width / pixelRatio;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		context.clearRect(0, 0, size, size);
		const field = game.field;
		const cell = (size - 12) / Math.max(field.columns, field.rows);
		const originX = (size - cell * field.columns) / 2;
		const originY = (size - cell * field.rows) / 2;
		const gap = cell > 4 ? 0.7 : 0;
		const cellX = tileIndex => originX + field.Column(tileIndex) * cell;
		const cellY = tileIndex => originY + field.Row(tileIndex) * cell;
		const centerX = tileIndex => originX + (field.Column(tileIndex) + 0.5) * cell;
		const centerY = tileIndex => originY + (field.Row(tileIndex) + 0.5) * cell;

		for (let i = 0; i < field.tileCount; i++) {
			const state = field.tileStates[i];
			if (state === TILE.OPEN) {
				context.fillStyle = field.adjacentMines[i] ? OPEN_NUMBER_COLOR : OPEN_EMPTY_COLOR;
			} else {
				context.fillStyle = TILE_COLORS[state];
			}
			context.fillRect(cellX(i), cellY(i), cell - gap, cell - gap);
		}
		context.fillStyle = '#ffcf5a';
		context.font = `700 ${Math.max(6, Math.round(cell * 0.9))}px "Chakra Petch", sans-serif`;
		context.textAlign = 'center';
		for (const tile of field.loreTiles) {
			const x = centerX(tile);
			const y = centerY(tile);
			if (cell >= 6) {
				context.fillText('?', x, y + cell * 0.32);
			} else {
				context.fillRect(x - 1, y - 1, 2, 2);
			}
		}
		if (field.supplyCrate) {
			context.fillStyle = '#6fb6ff';
			context.fillRect(cellX(field.supplyCrate.tile) - 1, cellY(field.supplyCrate.tile) - 1, cell + 2, cell + 2);
		}
		if (context.createConicGradient) {
			const sweep = context.createConicGradient(time * 1.4, size / 2, size / 2);
			sweep.addColorStop(0, 'rgba(120,255,170,.22)');
			sweep.addColorStop(0.12, 'rgba(120,255,170,0)');
			sweep.addColorStop(1, 'rgba(120,255,170,0)');
			context.fillStyle = sweep;
			context.fillRect(0, 0, size, size);
		}
		if (field.questTarget >= 0 && !field.isOver) {
			const x = centerX(field.questTarget);
			const y = centerY(field.questTarget);
			const pulse = (time * 1.2) % 1;
			context.strokeStyle = `rgba(255,201,74,${1 - pulse})`;
			context.lineWidth = 1.5;
			context.beginPath();
			context.arc(x, y, cell * 0.6 + pulse * cell * 2.4, 0, FULL_TURN);
			context.stroke();
			context.fillStyle = '#ffc94a';
			context.beginPath();
			context.arc(x, y, Math.max(2, cell * 0.45), 0, FULL_TURN);
			context.fill();
		}
		if (field.hoveredTile >= 0) {
			this.#DrawPlayerArrow(context, centerX(field.hoveredTile), centerY(field.hoveredTile), Math.max(4, cell * 0.9));
		}
	}


	/** The white arrow on the hovered tile ("you are here"). */
	#DrawPlayerArrow(context, x, y, size) {
		context.fillStyle = '#fff';
		context.beginPath();
		context.moveTo(x, y - size);
		context.lineTo(x + size * 0.65, y + size * 0.7);
		context.lineTo(x, y + size * 0.35);
		context.lineTo(x - size * 0.65, y + size * 0.7);
		context.closePath();
		context.fill();
	}
}


export const minimap = new Minimap();
