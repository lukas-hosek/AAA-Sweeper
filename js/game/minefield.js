/**
 * minefield.js: the pure Minesweeper board and its rules, free of DOM, audio and AAA reactions,
 * so the unit tests can play thousands of boards.
 */
import {random} from '../core/random.js';


/** States of one tile in Minefield.tileStates. */
export const TILE = Object.freeze({
	HIDDEN: 0,      // Not revealed yet
	OPEN: 1,        // Revealed: shows its number (or nothing)
	FLAGGED: 2,     // Marked as a mine by the player
	EXPLODED: 3,    // A mine the player stepped on: a crater that counts as a flag for chording
});


/**
 * A rectangular board of tiles, some of them mines. Tiles are addressed by index = row * columns + column.
 * Mines are planted on the first reveal, away from the tile clicked, so the first click is always safe.
 */
export class Minefield {
	columns;              // Board width in tiles
	rows;                 // Board height in tiles
	mineCount;            // Mines on the board
	tileCount;            // columns * rows
	isMine;               // Uint8Array: 1 where a mine is planted
	adjacentMines;        // Uint8Array: mines among the 8 neighbours (valid for safe tiles)
	tileStates;           // Uint8Array of TILE values
	minesPlanted = false; // False until the first reveal
	openedCount = 0;      // Safe tiles revealed so far
	flagCount = 0;        // Tiles currently flagged


	constructor(columns, rows, mineCount) {
		this.columns = columns;
		this.rows = rows;
		this.mineCount = mineCount;
		this.tileCount = columns * rows;
		this.isMine = new Uint8Array(this.tileCount);
		this.adjacentMines = new Uint8Array(this.tileCount);
		this.tileStates = new Uint8Array(this.tileCount);
	}


	/** Tile index of a column and row. */
	Index(column, row) {
		return row * this.columns + column;
	}


	/** Column of a tile index. */
	Column(tileIndex) {
		return tileIndex % this.columns;
	}


	/** Row of a tile index. */
	Row(tileIndex) {
		return Math.floor(tileIndex / this.columns);
	}


	/** Calls visit(neighbourIndex) for each of the up to 8 tiles around a tile, row by row. */
	ForEachNeighbor(tileIndex, visit) {
		const column = this.Column(tileIndex);
		const row = this.Row(tileIndex);
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx === 0 && dy === 0) {
					continue;
				}
				const neighbourColumn = column + dx;
				const neighbourRow = row + dy;
				if (neighbourColumn >= 0 && neighbourRow >= 0 && neighbourColumn < this.columns && neighbourRow < this.rows) {
					visit(neighbourRow * this.columns + neighbourColumn);
				}
			}
		}
	}


	/** Spreadsheet-style name of a tile, e.g. "A1" for the top-left corner and "AB3" for column 28, row 3. */
	TileLabel(tileIndex) {
		let columnNumber = this.Column(tileIndex) + 1;
		let letters = '';
		while (columnNumber > 0) {
			const letterIndex = (columnNumber - 1) % 26;
			letters = String.fromCharCode(65 + letterIndex) + letters;
			columnNumber = Math.floor((columnNumber - 1) / 26);
		}
		return letters + (this.Row(tileIndex) + 1);
	}


	/**
	 * Places the mines at random, never on `safeTile`, and never next to it when the board has room
	 * (so the first click opens an area). Then counts the neighbours of every safe tile.
	 * Returns the set of tiles that were kept free of mines.
	 */
	PlantMines(safeTile) {
		const keptFree = new Set([safeTile]);
		if (this.tileCount - this.mineCount >= 9) {
			this.ForEachNeighbor(safeTile, neighbour => keptFree.add(neighbour));
		}
		const candidates = [];
		for (let i = 0; i < this.tileCount; i++) {
			if (!keptFree.has(i)) {
				candidates.push(i);
			}
		}
		random.Shuffle(candidates);
		for (let k = 0; k < this.mineCount; k++) {
			this.isMine[candidates[k]] = 1;
		}
		for (let i = 0; i < this.tileCount; i++) {
			if (this.isMine[i]) {
				continue;
			}
			let count = 0;
			this.ForEachNeighbor(i, neighbour => {
				if (this.isMine[neighbour]) {
					count++;
				}
			});
			this.adjacentMines[i] = count;
		}
		this.minesPlanted = true;
		return keptFree;
	}


	/**
	 * Reveals a hidden safe tile and, flood-fill style, every tile reachable through tiles without adjacent mines.
	 * Returns the opened tiles in reveal order, each with its distance (in flood steps) from `startTile`.
	 */
	FloodOpen(startTile) {
		const opened = [];
		const queue = [{tile: startTile, distance: 0}];
		const queued = new Set([startTile]);
		for (let head = 0; head < queue.length; head++) {
			const {tile, distance} = queue[head];
			if (this.tileStates[tile] !== TILE.HIDDEN || this.isMine[tile]) {
				continue;
			}
			this.tileStates[tile] = TILE.OPEN;
			this.openedCount++;
			opened.push({tile, distance});
			// Only empty tiles spread the reveal; numbered tiles stop it
			if (this.adjacentMines[tile] === 0) {
				this.ForEachNeighbor(tile, neighbour => {
					if (!queued.has(neighbour) && this.tileStates[neighbour] === TILE.HIDDEN) {
						queued.add(neighbour);
						queue.push({tile: neighbour, distance: distance + 1});
					}
				});
			}
		}
		return opened;
	}


	/**
	 * The hidden neighbours a chord on an open number tile would reveal, or null when the chord is not allowed:
	 * the tile has no number, the flags (and craters) around it don't match its number, or nothing is left to reveal.
	 */
	ChordTargets(tileIndex) {
		const number = this.adjacentMines[tileIndex];
		if (!number) {
			return null;
		}
		let markedMines = 0;
		const hidden = [];
		this.ForEachNeighbor(tileIndex, neighbour => {
			const state = this.tileStates[neighbour];
			if (state === TILE.FLAGGED || state === TILE.EXPLODED) {
				markedMines++;
			} else if (state === TILE.HIDDEN) {
				hidden.push(neighbour);
			}
		});
		return markedMines === number && hidden.length ? hidden : null;
	}


	/** True for a hidden tile without a mine. */
	IsHiddenSafe(tileIndex) {
		return tileIndex >= 0 && this.tileStates[tileIndex] === TILE.HIDDEN && !this.isMine[tileIndex];
	}


	/**
	 * The hidden safe tile closest to `fromTile`, preferring tiles next to an open tile (the frontier).
	 * Returns -1 when no hidden safe tile is left.
	 */
	NearestSafeTile(fromTile) {
		let best = -1;
		let bestDistance = 1e9;
		const fromColumn = this.Column(fromTile);
		const fromRow = this.Row(fromTile);
		for (let i = 0; i < this.tileCount; i++) {
			if (!this.IsHiddenSafe(i)) {
				continue;
			}
			let onFrontier = false;
			this.ForEachNeighbor(i, neighbour => {
				if (this.tileStates[neighbour] === TILE.OPEN) {
					onFrontier = true;
				}
			});
			// Tiles away from the frontier only win when there is no frontier tile at all
			const distance = Math.hypot(this.Column(i) - fromColumn, this.Row(i) - fromRow) + (onFrontier ? 0 : 100);
			if (distance < bestDistance) {
				bestDistance = distance;
				best = i;
			}
		}
		return best;
	}


	/** True once every safe tile is open: the board is cleared. */
	IsCleared() {
		return this.minesPlanted && this.openedCount === this.tileCount - this.mineCount;
	}
}
