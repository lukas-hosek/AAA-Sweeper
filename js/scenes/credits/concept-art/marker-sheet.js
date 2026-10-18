/**
 * marker-sheet.js: the quest marker readability study: six ever bigger markers until playtesters found it.
 */
import {ConceptArtSheet, RED_INK} from './concept-art-sheet.js';


const LABELS = ['v1 subtle', 'v2', 'v3 visible', 'v4 very visible', 'v5 shouting', 'v6 MAXIMUM'];
const SIZES = [0.012, 0.02, 0.032, 0.05, 0.075, 0.11];       // Marker size as a fraction of the sheet
const PENCIL_COLOR = '#5a5040';


/** A row of tiles, each with a bigger diamond marker over it. All but the last are struck through. */
export class MarkerSheet extends ConceptArtSheet {
	Paint(width, height) {
		const {canvas, context} = this.CreateCanvas(width, height);
		this.PaintPaper(context, width, height);
		this.DrawHeading(context, width, height, 'QUEST MARKER · READABILITY STUDY', 'Playtest feedback: "I still could not find it"');
		for (let i = 0; i < 6; i++) {
			const x = width * (0.1 + 0.16 * i);
			const tileTop = height * 0.72;
			const size = Math.min(width, height) * SIZES[i] * 2.2;
			context.fillStyle = '#b7a98d';
			context.fillRect(x - width * 0.05, tileTop, width * 0.1, height * 0.06);
			context.strokeStyle = 'rgba(60,50,40,.4)';
			context.strokeRect(x - width * 0.05 + 0.5, tileTop + 0.5, width * 0.1, height * 0.06);
			if (i === 5) {
				// The final version also gets a beam of light to the top of the page
				const beam = context.createLinearGradient(0, tileTop, 0, height * 0.17);
				beam.addColorStop(0, 'rgba(255,190,60,.6)');
				beam.addColorStop(1, 'rgba(255,190,60,0)');
				context.fillStyle = beam;
				context.fillRect(x - size * 0.35, height * 0.17, size * 0.7, tileTop - height * 0.17);
			}
			this.#DrawDiamond(context, x, tileTop - size * 1.1 - height * 0.03, size);
			const labelSize = Math.max(10, Math.min(width * 0.02, height * 0.034));
			this.Handwrite(context, LABELS[i], x - width * 0.055, height * 0.85, labelSize, i === 5 ? RED_INK : PENCIL_COLOR, 0);
			if (i < 5) {
				context.strokeStyle = RED_INK;
				context.lineWidth = 2;
				context.beginPath();
				context.moveTo(x - width * 0.045, height * 0.87);
				context.lineTo(x + width * 0.045, height * 0.83);
				context.stroke();
			}
		}
		this.Handwrite(context, 'shipped ✓', width * 0.84, height * 0.93, Math.max(16, height * 0.042), RED_INK, -0.05);
		return canvas;
	}


	/** The gold diamond marker. */
	#DrawDiamond(context, x, y, size) {
		context.fillStyle = '#f2b43a';
		context.strokeStyle = '#5a3b00';
		context.lineWidth = 1.5;
		context.beginPath();
		context.moveTo(x, y - size);
		context.lineTo(x + size * 0.72, y);
		context.lineTo(x, y + size);
		context.lineTo(x - size * 0.72, y);
		context.closePath();
		context.fill();
		context.stroke();
	}
}
