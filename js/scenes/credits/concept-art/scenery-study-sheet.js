/**
 * scenery-study-sheet.js: a chapter's background painted as desaturated key art, taped to the sheet and scribbled on.
 */
import {random} from '../../../core/random.js';
import {CHAPTERS} from '../../../game/chapters.js';
import {BLUE_INK, ConceptArtSheet, RED_INK} from './concept-art-sheet.js';


const SCENERY_TIME = 7.3;           // Moment of the animated scenery to freeze
const SCENERY_DELTA_TIME = 0.016;


/** The real chapter scenery, faded towards sepia, with brush strokes over it and art-direction notes. */
export class SceneryStudySheet extends ConceptArtSheet {
	#chapterId;                     // The chapter whose scenery is painted
	#title;                         // Printed under the art
	#fileName;                      // Printed under the art on the right
	#notes;                         // [{x, y, text, arrowTo?: [x, y]}], positions as fractions of the art


	constructor(chapterId, title, fileName, notes, caption) {
		super(caption);
		this.#chapterId = chapterId;
		this.#title = title;
		this.#fileName = fileName;
		this.#notes = notes;
	}


	Paint(width, height) {
		const {canvas, context} = this.CreateCanvas(width, height);
		this.PaintPaper(context, width, height);
		const margin = Math.round(Math.min(width, height) * 0.06);
		const artWidth = width - 2 * margin;
		const artHeight = height - 2 * margin - Math.round(height * 0.06);
		this.#PaintScenery(context, margin, artWidth, artHeight);
		context.strokeStyle = 'rgba(50,40,30,.55)';
		context.lineWidth = 1;
		context.strokeRect(margin + 0.5, margin + 0.5, artWidth, artHeight);
		context.strokeRect(margin - 2.5, margin - 1.5, artWidth + 4, artHeight + 3);
		this.DrawTape(context, margin + 24, margin, -0.2);
		this.DrawTape(context, width - margin - 24, margin, 0.18);
		this.#WriteNotes(context, width, height, margin, artWidth, artHeight);
		context.font = `600 ${Math.round(height * 0.028)}px "Chakra Petch",sans-serif`;
		context.fillStyle = '#2b2620';
		context.textAlign = 'left';
		context.fillText(this.#title, margin, height - margin * 0.55);
		context.textAlign = 'right';
		context.fillStyle = '#7a6d58';
		context.fillText(this.#fileName, width - margin, height - margin * 0.55);
		context.textAlign = 'left';
		return canvas;
	}


	/** The scenery itself, desaturated and warmed, under hundreds of faint diagonal brush strokes. */
	#PaintScenery(context, margin, artWidth, artHeight) {
		const scenery = CHAPTERS.find(chapter => chapter.id === this.#chapterId).CreateScenery();
		scenery.Prepare(artWidth, artHeight);
		const art = this.CreateCanvas(artWidth, artHeight);
		scenery.Draw(art.context, artWidth, artHeight, SCENERY_TIME, SCENERY_DELTA_TIME);
		context.drawImage(art.canvas, margin, margin, artWidth, artHeight);
		context.globalCompositeOperation = 'saturation';
		context.fillStyle = 'rgba(128,128,128,.4)';
		context.fillRect(margin, margin, artWidth, artHeight);
		context.globalCompositeOperation = 'color';
		context.fillStyle = 'rgba(150,115,70,.14)';
		context.fillRect(margin, margin, artWidth, artHeight);
		context.globalCompositeOperation = 'source-over';
		for (let k = 0; k < 650; k++) {
			const x = margin + random.Next() * artWidth;
			const y = margin + random.Next() * artHeight;
			const length = random.Range(6, 22);
			const angle = -0.5 + random.Range(-0.2, 0.2);
			context.strokeStyle = random.Next() < 0.5 ? 'rgba(255,250,235,.06)' : 'rgba(30,20,10,.06)';
			context.lineWidth = random.Range(1.5, 5);
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
			context.stroke();
		}
	}


	/** Notes in alternating red and blue, each on a pale patch so it reads over the art, some with an arrow. */
	#WriteNotes(context, width, height, margin, artWidth, artHeight) {
		const fontSize = Math.max(12, Math.min(width, height) * 0.05);
		this.#notes.forEach((note, index) => {
			const x = margin + artWidth * note.x;
			const y = margin + artHeight * note.y;
			const color = index % 2 ? BLUE_INK : RED_INK;
			context.save();
			context.fillStyle = 'rgba(236,227,207,.7)';
			context.font = `700 ${Math.round(fontSize)}px Caveat,cursive`;
			const textWidth = context.measureText(note.text).width;
			context.fillRect(x - 6, y - fontSize * 0.85, textWidth + 12, fontSize * 1.15);
			context.restore();
			this.Handwrite(context, note.text, x, y, fontSize, color, random.Range(-0.05, 0.05));
			if (note.arrowTo) {
				const [targetX, targetY] = note.arrowTo;
				const toX = margin + artWidth * targetX;
				const toY = margin + artHeight * targetY;
				this.DrawArrow(context, x + fontSize * 0.6, y + fontSize * 0.35, toX, toY, color);
			}
		});
	}
}
