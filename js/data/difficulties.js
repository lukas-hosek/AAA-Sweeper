/**
 * difficulties.js: board sizes and mine counts.
 */


// Keyed by the id stored in the field and used in the menus
export const DIFFICULTIES = {
	story: {columns: 9, rows: 9, mines: 10, label: 'Story'},
	normal: {columns: 16, rows: 16, mines: 40, label: 'Normal'},
	veteran: {columns: 30, rows: 16, mines: 99, label: 'Veteran'},
};
