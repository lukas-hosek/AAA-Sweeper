// @ts-check
/**
 * minefield.test.js: the fairness rules of Minesweeper, checked on thousands of seeded boards.
 * Run by tools/browser/unit_tests.py (scripts/unit_tests.sh).
 */
import {random} from '/js/core/random.js';
import {CHAPTERS, ChapterForNumber} from '/js/game/chapters.js';
import {Minefield, TILE} from '/js/game/minefield.js';


// Board shapes: the three difficulties plus small, crowded boards where the first-click area cannot be kept free
const BOARD_SHAPES = [
	{columns: 9, rows: 9, mines: 10},
	{columns: 16, rows: 16, mines: 40},
	{columns: 30, rows: 16, mines: 99},
	{columns: 5, rows: 5, mines: 20},
	{columns: 4, rows: 3, mines: 6},
];


const BOARDS_PER_SHAPE = 300;


/**
 * Plants a seeded board with its first click at a random tile and opens that click.
 * @returns {{board: Minefield, firstClick: number}}
 */
function NewPlayedBoard(shape, seed) {
	random.Seed(seed);
	const board = new Minefield(shape.columns, shape.rows, shape.mines);
	const firstClick = Math.floor(random.Next() * board.tileCount);
	board.PlantMines(firstClick);
	board.FloodOpen(firstClick);
	return {board, firstClick};
}


/** Calls body(board, firstClick, shape) for every seeded board of every shape. */
function ForEveryBoard(body) {
	for (const shape of BOARD_SHAPES) {
		for (let seed = 1; seed <= BOARDS_PER_SHAPE; seed++) {
			const {board, firstClick} = NewPlayedBoard(shape, seed * 7919 + shape.columns);
			body(board, firstClick, shape);
		}
	}
}


/** Tile indices around a tile, collected into an array. */
function NeighboursOf(board, tileIndex) {
	const neighbours = [];
	board.ForEachNeighbor(tileIndex, neighbour => neighbours.push(neighbour));
	return neighbours;
}


/** Each test calls check(condition, message) and stops reporting after the first failure. */
export const TESTS = {
	'the first click is never a mine, nor next to one when the board has room'(check) {
		ForEveryBoard((board, firstClick) => {
			check(!board.isMine[firstClick], 'first click is a mine');
			if (board.tileCount - board.mineCount >= 9) {
				for (const neighbour of NeighboursOf(board, firstClick)) {
					check(!board.isMine[neighbour], 'mine next to the first click');
				}
			}
		});
	},

	'every board has exactly its mine count'(check) {
		ForEveryBoard(board => {
			const mines = board.isMine.reduce((sum, value) => sum + value, 0);
			check(mines === board.mineCount, `${mines} mines instead of ${board.mineCount}`);
		});
	},

	'every safe tile shows the number of mines around it'(check) {
		ForEveryBoard(board => {
			for (let i = 0; i < board.tileCount; i++) {
				if (!board.isMine[i]) {
					const count = NeighboursOf(board, i).filter(neighbour => board.isMine[neighbour]).length;
					check(board.adjacentMines[i] === count, `tile ${i} shows ${board.adjacentMines[i]}, has ${count}`);
				}
			}
		});
	},

	'flood fill opens only safe tiles, and every empty open tile has all neighbours open'(check) {
		ForEveryBoard(board => {
			let openTiles = 0;
			for (let i = 0; i < board.tileCount; i++) {
				if (board.tileStates[i] !== TILE.OPEN) {
					continue;
				}
				openTiles++;
				check(!board.isMine[i], 'an open tile is a mine');
				if (board.adjacentMines[i] === 0) {
					for (const neighbour of NeighboursOf(board, i)) {
						check(board.tileStates[neighbour] === TILE.OPEN, 'an empty tile has a hidden neighbour');
					}
				}
			}
			check(openTiles === board.openedCount, 'openedCount does not match the open tiles');
		});
	},

	'a chord works exactly when the flags around a number match it'(check) {
		ForEveryBoard(board => {
			for (let i = 0; i < board.tileCount; i++) {
				if (board.tileStates[i] !== TILE.OPEN || board.adjacentMines[i] === 0) {
					continue;
				}
				const neighbours = NeighboursOf(board, i);
				const hiddenMines = neighbours.filter(neighbour => board.tileStates[neighbour] === TILE.HIDDEN && board.isMine[neighbour]);
				const hiddenSafe = neighbours.filter(neighbour => board.tileStates[neighbour] === TILE.HIDDEN && !board.isMine[neighbour]);
				if (!hiddenSafe.length || hiddenMines.length !== board.adjacentMines[i]) {
					continue;
				}
				check(board.ChordTargets(i) === null, 'chord allowed without flags');
				for (const mine of hiddenMines) {
					board.tileStates[mine] = TILE.FLAGGED;
				}
				const targets = board.ChordTargets(i);
				check(targets !== null && targets.every(target => !board.isMine[target]), 'chord with correct flags failed or hits a mine');
				for (const mine of hiddenMines) {
					board.tileStates[mine] = TILE.HIDDEN;
				}
				return;
			}
		});
	},

	'the quest marker always points at a hidden safe tile until the board is cleared'(check) {
		ForEveryBoard((board, firstClick) => {
			let lastClick = firstClick;
			let steps = 0;
			while (!board.IsCleared()) {
				const target = board.NearestSafeTile(lastClick);
				check(board.IsHiddenSafe(target), `marker points at tile ${target}, which is not hidden and safe`);
				if (!board.IsHiddenSafe(target) || ++steps > board.tileCount) {
					return;
				}
				board.FloodOpen(target);
				lastClick = target;
			}
			check(board.NearestSafeTile(lastClick) === -1, 'a cleared board still has a marker target');
		});
	},

	'a board counts as cleared exactly when every safe tile is open'(check) {
		ForEveryBoard(board => {
			const safeTiles = board.tileCount - board.mineCount;
			check(board.IsCleared() === (board.openedCount === safeTiles), 'IsCleared disagrees with the open count');
			for (let i = 0; i < board.tileCount; i++) {
				if (board.IsHiddenSafe(i)) {
					board.FloodOpen(i);
				}
			}
			check(board.IsCleared(), 'not cleared after opening every safe tile');
		});
	},

	'New Game+ wraps around the chapters'(check) {
		for (let number = 1; number <= CHAPTERS.length * 3; number++) {
			check(ChapterForNumber(number) === CHAPTERS[(number - 1) % CHAPTERS.length], `field ${number} has the wrong chapter`);
		}
	},
};
