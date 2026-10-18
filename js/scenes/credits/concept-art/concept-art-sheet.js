/**
 * concept-art-sheet.js: the base class of the fake concept art shown beside the credits, with the drawing helpers
 * every sheet shares: paper, handwriting, arrows, tape and the printed heading.
 */
import {random} from '../../../core/random.js';
import {layout} from '../../../render/layout.js';


export const RED_INK = '#b8322a';
export const BLUE_INK = '#2a4d9b';
const PAPER_COLOR = '#ece3cf';
const PRINT_COLOR = '#2b2620';


/** A sheet of paper with sketches and scribbled notes. Subclasses draw the content in Paint(). */
export class ConceptArtSheet {
	caption;                // Shown under the art: "Sector B-4, key art"


	constructor(caption) {
		this.caption = caption;
	}


	/** Paints the sheet at `width` × `height` CSS pixels and returns the canvas. */
	Paint(width, height) {
		return this.CreateCanvas(width, height).canvas;
	}


	/** A canvas at the screen's pixel ratio, with a context that draws in CSS pixels. */
	CreateCanvas(width, height) {
		const pixelRatio = layout.viewport.pixelRatio;
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.round(width * pixelRatio));
		canvas.height = Math.max(1, Math.round(height * pixelRatio));
		const context = canvas.getContext('2d');
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		return {canvas, context};
	}


	/** Off-white paper with a fine speckle and darker edges. */
	PaintPaper(context, width, height) {
		context.fillStyle = PAPER_COLOR;
		context.fillRect(0, 0, width, height);
		for (let k = 0; k < width * height / 90; k++) {
			context.fillStyle = random.Next() < 0.5 ? 'rgba(120,100,70,.06)' : 'rgba(255,255,255,.12)';
			context.fillRect(random.Next() * width, random.Next() * height, 1.5, 1.5);
		}
		const edges = context.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.3, width / 2, height / 2,
			Math.max(width, height) * 0.75);
		edges.addColorStop(0, 'rgba(0,0,0,0)');
		edges.addColorStop(1, 'rgba(90,70,40,.22)');
		context.fillStyle = edges;
		context.fillRect(0, 0, width, height);
	}


	/** A handwritten note in marker. */
	Handwrite(context, text, x, y, size, color, rotation) {
		context.save();
		context.translate(x, y);
		context.rotate(rotation || 0);
		context.font = `700 ${Math.round(size)}px Caveat,"Comic Sans MS",cursive`;
		context.fillStyle = color;
		context.textAlign = 'left';
		context.fillText(text, 0, 0);
		context.restore();
	}


	/** A hand-drawn curved arrow with an open head. */
	DrawArrow(context, fromX, fromY, toX, toY, color) {
		context.strokeStyle = color;
		context.lineWidth = 2;
		context.lineCap = 'round';
		// The control point sits off to the side, so the arrow bows like a quick pen stroke
		const controlX = (fromX + toX) / 2 + (toY - fromY) * 0.25;
		const controlY = (fromY + toY) / 2 - (toX - fromX) * 0.25;
		context.beginPath();
		context.moveTo(fromX, fromY);
		context.quadraticCurveTo(controlX, controlY, toX, toY);
		context.stroke();
		const angle = Math.atan2(toY - controlY, toX - controlX);
		context.beginPath();
		context.moveTo(toX, toY);
		context.lineTo(toX - Math.cos(angle - 0.5) * 10, toY - Math.sin(angle - 0.5) * 10);
		context.moveTo(toX, toY);
		context.lineTo(toX - Math.cos(angle + 0.5) * 10, toY - Math.sin(angle + 0.5) * 10);
		context.stroke();
	}


	/** A strip of masking tape. */
	DrawTape(context, x, y, rotation) {
		context.save();
		context.translate(x, y);
		context.rotate(rotation);
		context.fillStyle = 'rgba(235,225,190,.78)';
		context.fillRect(-34, -10, 68, 20);
		context.restore();
	}


	/** The printed title and subtitle at the top left, and the confidentiality line at the bottom right. */
	DrawHeading(context, width, height, title, subtitle) {
		context.fillStyle = PRINT_COLOR;
		context.font = `700 ${Math.round(height * 0.045)}px "Chakra Petch",sans-serif`;
		context.textAlign = 'left';
		context.fillText(title, width * 0.05, height * 0.1);
		context.font = `500 ${Math.round(height * 0.026)}px "Chakra Petch",sans-serif`;
		context.fillStyle = '#6d6250';
		context.fillText(subtitle, width * 0.05, height * 0.15);
		context.textAlign = 'right';
		context.fillText('TRIPLE A SWEEPER · CONCEPT · CONFIDENTIAL', width * 0.95, height * 0.95);
		context.textAlign = 'left';
	}
}
