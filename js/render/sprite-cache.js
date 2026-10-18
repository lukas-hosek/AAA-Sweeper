/**
 * sprite-cache.js: the tile sprites of the current field, pre-painted at the current tile size.
 */
import {FULL_TURN} from '../core/math.js';
import {random} from '../core/random.js';
import {game} from '../game/game.js';
import {layout} from './layout.js';


// Colour of each number 1..8 on an opened tile
const NUMBER_COLORS = ['', '#55a8ff', '#3fe08b', '#ff4f60', '#a08bff', '#ff9b3d', '#2fe6d6', '#f4f4f4', '#a2a9ae'];
const MIN_SPRITE_SIZE = 8;


/**
 * Every tile image the board needs, painted once per tile size and tileset: hidden variants (per column parity
 * for striped tilesets), hovered, opened, the numbers 1 to 8 and the crater. Rebuilt on layout changes and once
 * the web fonts have loaded (the numbers use Teko).
 */
export class SpriteCache {
	size = 0;                       // Sprite edge in device pixels
	variantCount = 1;               // Hidden variants per column parity
	hiddenVariants = [[], []];      // [column parity][variant] hidden tiles
	hidden = null;                  // One plain hidden tile (reveal animations)
	hovered = null;
	open = null;
	numbers = [null];               // Number sprites, indexed 1..8
	crater = null;                  // An exploded mine


	/** Rebuilds the sprites when the web fonts finish loading, so the numbers use the right font. */
	Init() {
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => {
				if (game.field) {
					this.Build();
				}
			});
		}
	}


	/** Paints all sprites for the current field's tileset at the current tile size. */
	Build() {
		const size = Math.max(MIN_SPRITE_SIZE, Math.round(layout.board.tileSize * layout.viewport.pixelRatio));
		const tileset = game.field.chapter.tileset;
		this.size = size;
		this.variantCount = tileset.variantCount;
		const lightVariants = Array.from({length: this.variantCount}, () => tileset.DrawHidden(size, false, false));
		const darkVariants = tileset.hasColumnStripes
			? Array.from({length: this.variantCount}, () => tileset.DrawHidden(size, false, true))
			: lightVariants;
		this.hiddenVariants = [lightVariants, darkVariants];
		this.hidden = lightVariants[0];
		this.hovered = tileset.DrawHidden(size, true, false);
		this.open = tileset.DrawOpen(size);
		this.numbers = [null];
		for (let number = 1; number <= 8; number++) {
			this.numbers.push(this.NumberSprite(size, number));
		}
		this.crater = this.#Crater(size, tileset);
	}


	/** The hidden-tile sprite of a tile (its variant comes from a hash of the index, so it never changes). */
	HiddenSprite(tileIndex, column) {
		return this.hiddenVariants[column & 1][this.VariantFor(tileIndex)];
	}


	/** Variant number of a tile: a multiplicative hash, so neighbours differ but each tile keeps its look. */
	VariantFor(tileIndex) {
		return ((tileIndex * 2654435761) >>> 0) % this.variantCount;
	}


	/** A glowing number in its colour, layered for the bloom. */
	NumberSprite(size, number) {
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const context = canvas.getContext('2d');
		context.font = `600 ${Math.round(size * 0.92)}px Teko, "Arial Narrow", sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'alphabetic';
		// Centre the glyph by its actual ink, not the font's line box
		const metrics = context.measureText(String(number));
		const ascent = metrics.actualBoundingBoxAscent || size * 0.6;
		const descent = metrics.actualBoundingBoxDescent || 0;
		const y = size / 2 + (ascent - descent) / 2;
		const color = NUMBER_COLORS[number];
		context.shadowColor = color;
		context.shadowBlur = size * 0.38;
		context.fillStyle = color;
		context.fillText(String(number), size / 2, y);
		context.shadowBlur = size * 0.12;
		context.fillText(String(number), size / 2, y);
		context.shadowBlur = 0;
		context.globalAlpha = 0.5;
		context.fillStyle = '#fff';
		context.fillText(String(number), size / 2, y - size * 0.01);
		context.globalAlpha = 1;
		context.fillStyle = color;
		context.globalAlpha = 0.6;
		context.fillText(String(number), size / 2, y);
		return canvas;
	}


	/** A scorched opened tile with cracks and the mine in the middle. */
	#Crater(size, tileset) {
		const canvas = tileset.DrawOpen(size);
		const context = canvas.getContext('2d');
		const scorch = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7);
		scorch.addColorStop(0, 'rgba(255,120,40,.55)');
		scorch.addColorStop(0.35, 'rgba(120,30,10,.5)');
		scorch.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = scorch;
		context.fillRect(0, 0, size, size);
		context.strokeStyle = 'rgba(0,0,0,.6)';
		context.lineWidth = 1;
		for (let k = 0; k < 6; k++) {
			const angle = random.Range(0, FULL_TURN);
			context.beginPath();
			context.moveTo(size / 2, size / 2);
			context.lineTo(size / 2 + Math.cos(angle) * size * 0.5, size / 2 + Math.sin(angle) * size * 0.5);
			context.stroke();
		}
		this.#DrawMine(context, size / 2, size / 2, size * 0.2);
		return canvas;
	}


	/** A classic naval mine: eight spikes and a shaded ball with a highlight. */
	#DrawMine(context, centerX, centerY, radius) {
		context.strokeStyle = '#07090b';
		context.lineWidth = Math.max(1, radius * 0.32);
		context.lineCap = 'round';
		for (let k = 0; k < 8; k++) {
			const angle = k * Math.PI / 4;
			const length = radius * (k % 2 ? 1.35 : 1.6);
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
			context.stroke();
		}
		const highlightX = centerX - radius * 0.35;
		const highlightY = centerY - radius * 0.35;
		const shading = context.createRadialGradient(highlightX, highlightY, radius * 0.1, centerX, centerY, radius);
		shading.addColorStop(0, '#6a7580');
		shading.addColorStop(1, '#07090b');
		context.fillStyle = shading;
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, FULL_TURN);
		context.fill();
		context.fillStyle = 'rgba(255,255,255,.85)';
		context.beginPath();
		context.arc(centerX - radius * 0.38, centerY - radius * 0.38, radius * 0.22, 0, FULL_TURN);
		context.fill();
	}
}


export const sprites = new SpriteCache();
