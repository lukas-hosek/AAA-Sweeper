/**
 * tileset.js: the base class of the six tile looks.
 */
import {random} from '../../core/random.js';


/**
 * One look for the board: how hidden and opened tiles are painted, and how the board frame is dressed.
 * Tiles are painted once per tile size into offscreen canvases (see SpriteCache); every Draw... method
 * returns a new square canvas of `size` device pixels.
 */
export class Tileset {
	variantCount = 1;              // Hidden-tile variants, picked per tile so the texture doesn't visibly repeat
	hasColumnStripes = false;      // Alternate columns get the darker variants (the lawn's mowing stripes)
	frameColors;                   // Board frame gradient: [top colour, bottom colour]
	rivetColor = null;             // Colour of the four rivets at the frame corners, or null for none


	constructor(frameColors, rivetColor) {
		this.frameColors = frameColors;
		this.rivetColor = rivetColor;
	}


	/** Paints a hidden tile. `isDarkStripe` asks for the darker variant of striped tilesets. */
	DrawHidden(size, isHovered, isDarkStripe) {
		return this.CreateTileCanvas(size).canvas;
	}


	/** Paints an opened (revealed) tile. */
	DrawOpen(size) {
		return this.CreateTileCanvas(size).canvas;
	}


	/** Extra lines around the board frame, drawn on top of the frame fill (the dance floor's neon). */
	DrawFrameAccent(context, frameRect, cornerRadius, time) {
	}


	/** Animated touches drawn over the tiles (flowers, frost glints, the pulsing dance floor). */
	DrawBoardDecorations(context, field, board, time, now) {
	}


	/** A new square canvas of `size` pixels and its 2D context. */
	CreateTileCanvas(size) {
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		return {canvas, context: canvas.getContext('2d')};
	}


	/** Single-pixel specks in two colours, for grainy surfaces. */
	Speckle(context, size, count, colorA, colorB) {
		for (let k = 0; k < count; k++) {
			context.fillStyle = random.Next() < 0.5 ? colorA : colorB;
			context.fillRect(random.Next() * size, random.Next() * size, 1, 1);
		}
	}


	/** Raised-tile bevel: a light top-left edge and a dark bottom-right edge, `bevel` pixels wide. */
	DrawBevel(context, size, bevel, lightColor, darkColor) {
		context.fillStyle = lightColor;
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(size, 0);
		context.lineTo(size - bevel, bevel);
		context.lineTo(bevel, bevel);
		context.lineTo(bevel, size - bevel);
		context.lineTo(0, size);
		context.closePath();
		context.fill();
		context.fillStyle = darkColor;
		context.beginPath();
		context.moveTo(size, size);
		context.lineTo(0, size);
		context.lineTo(bevel, size - bevel);
		context.lineTo(size - bevel, size - bevel);
		context.lineTo(size - bevel, bevel);
		context.lineTo(size, 0);
		context.closePath();
		context.fill();
	}


	/** Sunken-tile edges: a shadow along the top and left, and (if given) a highlight line along the bottom and right. */
	DrawSunkenEdges(context, size, shadowColor, highlightColor) {
		const shadow = Math.max(1, Math.round(size * 0.06));
		context.fillStyle = shadowColor;
		context.fillRect(0, 0, size, shadow);
		context.fillRect(0, 0, shadow, size);
		if (highlightColor) {
			context.fillStyle = highlightColor;
			context.fillRect(0, size - 1, size, 1);
			context.fillRect(size - 1, 0, 1, size);
		}
	}


	/** A one-pixel outline around the tile. */
	DrawOutline(context, size, color) {
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.strokeRect(0.5, 0.5, size - 1, size - 1);
	}


	/** Fills the tile with a two- or three-stop gradient along a line. */
	FillGradient(context, size, line, stops) {
		const gradient = context.createLinearGradient(line[0], line[1], line[2], line[3]);
		for (const [offset, color] of stops) {
			gradient.addColorStop(offset, color);
		}
		context.fillStyle = gradient;
		context.fillRect(0, 0, size, size);
	}
}
