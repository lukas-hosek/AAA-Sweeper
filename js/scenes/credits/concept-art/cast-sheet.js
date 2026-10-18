/**
 * cast-sheet.js: the character sheet: the radio portraits as pinned photos with names and notes.
 */
import {random} from '../../../core/random.js';
import {CHARACTERS} from '../../../data/characters.js';
import {portraitPainter} from '../../../ui/portrait-painter.js';
import {BLUE_INK, ConceptArtSheet, RED_INK} from './concept-art-sheet.js';


const PORTRAIT_PIXELS = 168;        // The portraits are painted at this size, then scaled onto the sheet
const COLUMNS = 4;


// [speaker, note]
const CAST = [
	['reyes', 'gruff but fair'],
	['kova', 'sorry (not sorry)'],
	['dez', 'LOUDER'],
	['qm', 'sells flags'],
	['mom', 'always calling'],
	['jenkins', 'helmet 2 sizes too big'],
	['dj', 'never slows down'],
	['prof', 'studies ice'],
];


/** Eight portraits in two rows, each slightly crooked, with a white border and a shadow. */
export class CastSheet extends ConceptArtSheet {
	Paint(width, height) {
		const {canvas, context} = this.CreateCanvas(width, height);
		this.PaintPaper(context, width, height);
		this.DrawHeading(context, width, height, 'CAST · CHARACTER SHEET', 'Radio portraits, final pass');
		const left = width * 0.05;
		const top = height * 0.21;
		const cellWidth = (width * 0.9) / COLUMNS;
		const cellHeight = (height * 0.68) / 2;
		const photoSize = Math.min(cellWidth * 0.6, cellHeight * 0.58);
		const portrait = document.createElement('canvas');
		portrait.width = portrait.height = PORTRAIT_PIXELS;
		CAST.forEach(([speakerId, note], index) => {
			const x = left + (index % COLUMNS) * cellWidth + cellWidth / 2;
			const y = top + Math.floor(index / COLUMNS) * cellHeight;
			portraitPainter.Paint(speakerId, portrait);
			context.save();
			context.translate(x, y + photoSize / 2);
			context.rotate(random.Range(-0.05, 0.05));
			context.fillStyle = '#fff';
			context.shadowColor = 'rgba(0,0,0,.25)';
			context.shadowBlur = 8;
			context.fillRect(-photoSize / 2 - 6, -photoSize / 2 - 6, photoSize + 12, photoSize + 12);
			context.shadowBlur = 0;
			context.drawImage(portrait, -photoSize / 2, -photoSize / 2, photoSize, photoSize);
			context.restore();
			context.font = `600 ${Math.round(Math.max(10, cellHeight * 0.07))}px "Chakra Petch",sans-serif`;
			context.fillStyle = '#2b2620';
			context.textAlign = 'center';
			context.fillText(CHARACTERS[speakerId].name.toUpperCase(), x, y + photoSize + cellHeight * 0.12);
			context.textAlign = 'left';
			const noteSize = Math.max(11, cellHeight * 0.1);
			const ink = index % 2 ? BLUE_INK : RED_INK;
			this.Handwrite(context, note, x - photoSize * 0.5, y + photoSize + cellHeight * 0.24, noteSize, ink, -0.03);
		});
		return canvas;
	}
}
