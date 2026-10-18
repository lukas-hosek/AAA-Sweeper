/**
 * sandstone-tileset.js: weathered sandstone blocks (The Dune Sea).
 */
import {random} from '../../core/random.js';
import {Tileset} from './tileset.js';


/** Grainy sandstone with the occasional crack and chipped corner; four variants. */
export class SandstoneTileset extends Tileset {
	variantCount = 4;


	constructor() {
		super(['#8a6a44', '#46301c'], '#c49a62');
	}


	DrawHidden(size, isHovered) {
		const {canvas, context} = this.CreateTileCanvas(size);
		const bevel = Math.max(1, Math.round(size * 0.1));
		this.FillGradient(context, size, [0, 0, size, size], [
			[0, isHovered ? '#f8e0ae' : '#e8c993'],
			[0.55, isHovered ? '#e0bd84' : '#cda46c'],
			[1, isHovered ? '#ba915b' : '#a37b48'],
		]);
		this.Speckle(context, size, size * size / 8, 'rgba(255,246,222,.22)', 'rgba(96,58,22,.2)');
		this.DrawBevel(context, size, bevel, 'rgba(255,244,214,.5)', 'rgba(84,50,18,.55)');
		if (random.Next() < 0.55) {
			this.#DrawCrack(context, size, bevel);
		}
		if (random.Next() < 0.3) {
			this.#ChipCorner(context, size);
		}
		this.DrawOutline(context, size, 'rgba(70,40,12,.55)');
		return canvas;
	}


	DrawOpen(size) {
		const {canvas, context} = this.CreateTileCanvas(size);
		this.FillGradient(context, size, [0, 0, size, size], [[0, '#6f4f30'], [1, '#4a321e']]);
		this.Speckle(context, size, size * size / 10, 'rgba(255,220,170,.12)', 'rgba(0,0,0,.15)');
		this.DrawSunkenEdges(context, size, 'rgba(30,15,5,.5)', 'rgba(255,220,170,.08)');
		return canvas;
	}


	/** A crack running down from the top edge in three jagged segments. */
	#DrawCrack(context, size, bevel) {
		context.strokeStyle = 'rgba(96,58,26,.5)';
		context.lineWidth = Math.max(0.7, size * 0.025);
		context.beginPath();
		let x = random.Range(bevel, size - bevel);
		let y = bevel;
		context.moveTo(x, y);
		for (let k = 0; k < 3; k++) {
			x += random.Range(-size * 0.15, size * 0.15);
			y += random.Range(size * 0.12, size * 0.28);
			context.lineTo(x, y);
		}
		context.stroke();
	}


	/** Cuts a small triangle out of one random corner. */
	#ChipCorner(context, size) {
		context.globalCompositeOperation = 'destination-out';
		const chip = size * 0.14;
		const corner = Math.floor(random.Next() * 4);
		const cornerX = corner % 2 ? size : 0;
		const cornerY = corner > 1 ? size : 0;
		const inwardX = corner % 2 ? -chip : chip;
		const inwardY = corner > 1 ? -chip : chip;
		context.beginPath();
		context.moveTo(cornerX, cornerY);
		context.lineTo(cornerX + inwardX, cornerY);
		context.lineTo(cornerX, cornerY + inwardY);
		context.closePath();
		context.fill();
		context.globalCompositeOperation = 'source-over';
	}
}
