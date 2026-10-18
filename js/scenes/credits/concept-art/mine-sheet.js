/**
 * mine-sheet.js: fourteen weeks of iterating on the mine, nine versions on one sheet.
 */
import {FULL_TURN} from '../../../core/math.js';
import {ConceptArtSheet, RED_INK} from './concept-art-sheet.js';


const NOTES = ['too friendly', 'too round', 'meh', 'spiky enough?', 'more spikes', 'scarier', 'hedgehog?', 'same as v3?', 'APPROVED'];
const PENCIL_COLOR = '#5a5040';


/**
 * A 3 × 3 grid of mines with ever more spikes. The first one smiles and is crossed out with the second; the last is
 * circled as approved.
 */
export class MineSheet extends ConceptArtSheet {
	Paint(width, height) {
		const {canvas, context} = this.CreateCanvas(width, height);
		this.PaintPaper(context, width, height);
		this.DrawHeading(context, width, height, 'THE MINE · ITERATIONS', 'Exploration, weeks 1–14');
		for (let i = 0; i < 9; i++) {
			const x = width * (0.2 + 0.3 * (i % 3));
			const y = height * (0.32 + 0.22 * Math.floor(i / 3));
			const radius = Math.min(width, height) * 0.04 * (1 + (i % 3) * 0.1);
			this.#DrawMine(context, x, y, radius, 4 + i, i === 1 ? 1.3 : 1);
			if (i === 0) {
				this.#DrawSmile(context, x, y, radius);
			}
			const noteSize = Math.max(11, Math.min(width * 0.024, height * 0.042));
			const ink = i === 8 ? RED_INK : PENCIL_COLOR;
			this.Handwrite(context, `v${i + 1} · ${NOTES[i]}`, x - radius * 1.9, y + radius * 2.5, noteSize, ink, 0);
			if (i === 8) {
				context.strokeStyle = RED_INK;
				context.lineWidth = 3;
				context.beginPath();
				context.ellipse(x, y, radius * 2.5, radius * 2.2, 0.1, 0, FULL_TURN);
				context.stroke();
			}
			if (i < 2) {
				context.strokeStyle = RED_INK;
				context.lineWidth = 2.5;
				context.beginPath();
				context.moveTo(x - radius * 2, y - radius * 2);
				context.lineTo(x + radius * 2, y + radius * 2);
				context.stroke();
			}
		}
		return canvas;
	}


	/** A round mine with `spikes` spikes and a highlight; `bodyScale` makes it rounder. */
	#DrawMine(context, x, y, radius, spikes, bodyScale) {
		context.strokeStyle = '#15181b';
		context.lineWidth = Math.max(2, radius * 0.28);
		context.lineCap = 'round';
		for (let k = 0; k < spikes; k++) {
			const angle = k * 2 * Math.PI / spikes;
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x + Math.cos(angle) * radius * 1.6, y + Math.sin(angle) * radius * 1.6);
			context.stroke();
		}
		context.fillStyle = '#1b1f23';
		context.beginPath();
		context.arc(x, y, radius * bodyScale, 0, FULL_TURN);
		context.fill();
		context.fillStyle = 'rgba(255,255,255,.8)';
		context.beginPath();
		context.arc(x - radius * 0.38, y - radius * 0.38, radius * 0.2, 0, FULL_TURN);
		context.fill();
	}


	/** Version one had a face. */
	#DrawSmile(context, x, y, radius) {
		context.strokeStyle = '#fff';
		context.lineWidth = 2;
		context.beginPath();
		context.arc(x, y + radius * 0.05, radius * 0.45, 0.25, Math.PI - 0.25);
		context.stroke();
		context.fillStyle = '#fff';
		context.fillRect(x - radius * 0.35, y - radius * 0.3, 3, 3);
		context.fillRect(x + radius * 0.25, y - radius * 0.3, 3, 3);
	}
}
