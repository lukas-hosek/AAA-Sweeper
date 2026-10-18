/**
 * camera.js: the offset of the board on screen (sway and shake).
 */
import {game} from '../game/game.js';
import {layout} from './layout.js';


/** The board's offset from its resting place, in CSS pixels. The renderer moves it every frame. */
export class Camera {
	x = 0;    // Horizontal offset
	y = 0;    // Vertical offset


	/** Centre of a tile of the current field without the camera offset: the coordinates particles live in. */
	TileCenter(tileIndex) {
		const field = game.field;
		const board = layout.board;
		return {
			x: board.x + (field.Column(tileIndex) + 0.5) * board.tileSize,
			y: board.y + (field.Row(tileIndex) + 0.5) * board.tileSize,
		};
	}


	/** Screen position (CSS pixels) of the centre of a tile of the current field, including the camera offset. */
	TileToScreen(tileIndex) {
		const center = this.TileCenter(tileIndex);
		return {x: center.x + this.x, y: center.y + this.y};
	}


	/** The tile under a screen position (CSS pixels), or -1 outside the board. */
	TileAtScreen(screenX, screenY) {
		const field = game.field;
		if (!field) {
			return -1;
		}
		const board = layout.board;
		const column = Math.floor((screenX - this.x - board.x) / board.tileSize);
		const row = Math.floor((screenY - this.y - board.y) / board.tileSize);
		if (column < 0 || row < 0 || column >= field.columns || row >= field.rows) {
			return -1;
		}
		return row * field.columns + column;
	}
}


export const camera = new Camera();
