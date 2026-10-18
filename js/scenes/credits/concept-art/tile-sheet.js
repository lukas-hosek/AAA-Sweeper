/**
 * tile-sheet.js: the material study: every chapter's tileset, a hidden and an open tile each.
 */
import {CHAPTERS} from '../../../game/chapters.js';
import {layout} from '../../../render/layout.js';
import {sprites} from '../../../render/sprite-cache.js';
import {BLUE_INK, ConceptArtSheet, RED_INK} from './concept-art-sheet.js';


const DANCE_FLOOR = 2;


// [material name, note], in chapter order
const MATERIALS = [
	['Steel', 'approved'],
	['Sandstone', 'more sand'],
	['Dance floor', 'BRIGHTER??'],
	['Ice', 'too slippery'],
	['Bulkhead', 'leaks (on purpose)'],
	['Lawn', 'Dad approved'],
];


/** Two rows of three: hidden tile, open tile with a 3, the material name and a note. The dance floor glows. */
export class TileSheet extends ConceptArtSheet {
	Paint(width, height) {
		const {canvas, context} = this.CreateCanvas(width, height);
		this.PaintPaper(context, width, height);
		this.DrawHeading(context, width, height, 'TILES · MATERIAL STUDY', 'Six materials, one hitbox');
		const size = Math.round(Math.min(width * 0.1, height * 0.15));
		const pixels = Math.max(8, Math.round(size * layout.viewport.pixelRatio));
		const three = sprites.NumberSprite(pixels, 3);
		// All tiles first, in this order: painting draws random numbers
		const tiles = CHAPTERS.map(chapter => [chapter.tileset.DrawHidden(pixels, false, false), chapter.tileset.DrawOpen(pixels)]);
		MATERIALS.forEach(([name, note], i) => {
			const x = width * (0.06 + 0.31 * (i % 3));
			const y = height * (0.21 + 0.37 * Math.floor(i / 3));
			const [hidden, open] = tiles[i];
			context.drawImage(hidden, x, y, size, size);
			context.drawImage(open, x + size + 6, y, size, size);
			context.drawImage(three, x + size + 6, y, size, size);
			if (i === DANCE_FLOOR) {
				context.globalCompositeOperation = 'lighter';
				context.fillStyle = 'rgba(255,80,220,.4)';
				context.fillRect(x + size * 0.14, y + size * 0.14, size * 0.72, size * 0.72);
				context.globalCompositeOperation = 'source-over';
			}
			context.font = `600 ${Math.round(Math.max(9, height * 0.03))}px "Chakra Petch",sans-serif`;
			context.fillStyle = '#2b2620';
			context.fillText(name.toUpperCase(), x, y + size + height * 0.055);
			const noteSize = Math.max(11, Math.min(width * 0.022, height * 0.04));
			this.Handwrite(context, note, x, y + size + height * 0.115, noteSize, i % 2 ? BLUE_INK : RED_INK, -0.04);
		});
		return canvas;
	}
}
