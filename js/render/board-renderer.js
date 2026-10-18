/**
 * board-renderer.js: draws the board: frame, captions, tiles, flags, tileset decorations, light effects, supply crate.
 */
import {Clamp, FULL_TURN} from '../core/math.js';
import {profile} from '../core/player-profile.js';
import {NowSeconds} from '../core/time.js';
import {FLAG_SKINS} from '../data/store.js';
import {TUNING} from '../data/tuning.js';
import {input} from '../game/input/input-controller.js';
import {TILE} from '../game/minefield.js';
import {oxygenReadout} from '../ui/oxygen-readout.js';
import {TraceRoundedRect} from './canvas-shapes.js';
import {LAYOUT_KIND, layout} from './layout.js';
import {sprites} from './sprite-cache.js';


const REVEAL_FADE_SECONDS = 0.24;     // A revealed tile's number fades in over this time
const SHEEN_PERIOD_SECONDS = 7;       // A light sweep crosses the board every 7 seconds
const FLAG_WAVE_POINTS = 6;


/**
 * Everything drawn in board space (the caller has applied the camera offset). The frame and decorations come from
 * the field's tileset; tiles come from the sprite cache.
 */
export class BoardRenderer {
	/** Draws the frame, captions, the Pathos-4 readout, the tiles and the light effects over them. */
	Draw(context, field, time, cameraX, cameraY) {
		const board = layout.board;
		const tileset = field.chapter.tileset;
		const padding = Math.max(8, Math.round(board.tileSize * 0.34));
		this.#DrawFrame(context, tileset, padding, time);
		this.#DrawCaptions(context, field, padding);
		const now = NowSeconds();
		this.#DrawTiles(context, field, time, now);
		tileset.DrawBoardDecorations(context, field, board, time, now);
		this.#DrawLightEffects(context, field, time, cameraX, cameraY);
	}


	/** The supply crate: dropping on its parachute, then sitting on its tile in a beam of light. */
	DrawSupplyCrate(context, field, time) {
		const crate = field.supplyCrate;
		if (!crate) {
			return;
		}
		const tileSize = layout.board.tileSize;
		const x = layout.board.x + (field.Column(crate.tile) + 0.5) * tileSize;
		const landingY = layout.board.y + (field.Row(crate.tile) + 0.5) * tileSize;
		const dropProgress = Clamp((field.clock - crate.spawnTime) / TUNING.supplyDrop.fallDuration, 0, 1);
		const eased = 1 - Math.pow(1 - dropProgress, 2.2);
		const startY = layout.board.y - tileSize * 5;
		const y = startY + (landingY - startY) * eased;
		const size = tileSize * 0.72;

		context.save();
		context.globalCompositeOperation = 'lighter';
		const beam = context.createLinearGradient(0, landingY, 0, landingY - tileSize * 6);
		beam.addColorStop(0, 'rgba(110,180,255,.42)');
		beam.addColorStop(1, 'rgba(110,180,255,0)');
		context.fillStyle = beam;
		context.fillRect(x - tileSize * 0.25, landingY - tileSize * 6, tileSize * 0.5, tileSize * 6);
		context.restore();

		if (!crate.hasLanded) {
			// Parachute lines and canopy
			context.strokeStyle = 'rgba(230,230,230,.6)';
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(x - size / 2, y - size / 2);
			context.lineTo(x - tileSize * 0.8, y - tileSize * 1.4);
			context.moveTo(x + size / 2, y - size / 2);
			context.lineTo(x + tileSize * 0.8, y - tileSize * 1.4);
			context.stroke();
			context.fillStyle = '#d9dde0';
			context.beginPath();
			context.ellipse(x, y - tileSize * 1.4, tileSize * 0.85, tileSize * 0.42, 0, Math.PI, 0);
			context.fill();
			context.fillStyle = '#c0392b';
			context.fillRect(x - tileSize * 0.1, y - tileSize * 1.82, tileSize * 0.2, tileSize * 0.42);
		}
		const bob = crate.hasLanded ? Math.sin(time * 3) * 1.5 : 0;
		context.fillStyle = '#4b5a33';
		context.fillRect(x - size / 2, y - size / 2 + bob, size, size);
		context.fillStyle = '#38452a';
		context.fillRect(x - size / 2, y - size / 2 + bob, size, size * 0.18);
		context.strokeStyle = '#1c2414';
		context.lineWidth = 1.5;
		context.strokeRect(x - size / 2, y - size / 2 + bob, size, size);
		// The white cross
		context.fillStyle = '#e8e2c8';
		context.fillRect(x - size * 0.08, y - size * 0.28 + bob, size * 0.16, size * 0.56);
		context.fillRect(x - size * 0.28, y - size * 0.08 + bob, size * 0.56, size * 0.16);
		if (crate.hasLanded) {
			context.font = `600 ${Math.round(Clamp(tileSize * 0.36, 10, 14))}px "Chakra Petch", sans-serif`;
			context.textAlign = 'center';
			context.fillStyle = '#bfe0ff';
			context.fillText('SUPPLY DROP', x, y - size * 0.75);
		}
	}


	/** The rounded frame with its drop shadow, the tileset's accent, edges and corner rivets. */
	#DrawFrame(context, tileset, padding, time) {
		const board = layout.board;
		const frameRect = {
			x: board.x - padding,
			y: board.y - padding,
			width: board.width + padding * 2,
			height: board.height + padding * 2,
		};
		context.save();
		context.shadowColor = 'rgba(0,0,0,.8)';
		context.shadowBlur = 50;
		context.shadowOffsetY = 18;
		TraceRoundedRect(context, frameRect.x, frameRect.y, frameRect.width, frameRect.height, padding * 0.6);
		const fill = context.createLinearGradient(0, board.y - padding, 0, board.y + board.height + padding);
		fill.addColorStop(0, tileset.frameColors[0]);
		fill.addColorStop(1, tileset.frameColors[1]);
		context.fillStyle = fill;
		context.fill();
		context.restore();
		tileset.DrawFrameAccent(context, frameRect, padding * 0.5, time);
		context.strokeStyle = 'rgba(255,255,255,.1)';
		context.lineWidth = 1;
		TraceRoundedRect(context, frameRect.x + 0.5, frameRect.y + 0.5, frameRect.width - 1, frameRect.height - 1, padding * 0.6);
		context.stroke();
		context.strokeStyle = 'rgba(0,0,0,.8)';
		context.strokeRect(board.x - 1.5, board.y - 1.5, board.width + 3, board.height + 3);
		if (tileset.rivetColor) {
			context.fillStyle = tileset.rivetColor;
			const left = board.x - padding / 2;
			const right = board.x + board.width + padding / 2;
			const top = board.y - padding / 2;
			const bottom = board.y + board.height + padding / 2;
			for (const [x, y] of [[left, top], [right, top], [left, bottom], [right, bottom]]) {
				context.beginPath();
				context.arc(x, y, Math.max(1.5, padding * 0.16), 0, FULL_TURN);
				context.fill();
			}
		}
	}


	/** The small text above the board (field name and threat), or the Pathos-4 flood readout instead. */
	#DrawCaptions(context, field, padding) {
		const board = layout.board;
		const captionY = board.y - padding - 8;
		const floods = field.chapter.floods;
		context.font = '600 10px "Chakra Petch", sans-serif';
		context.textAlign = 'left';
		context.fillStyle = 'rgba(233,238,242,.5)';
		if (captionY > 0 && !floods) {
			const fieldNumber = String(field.fieldNumber).padStart(2, '0');
			const caption = `${field.chapter.name.toUpperCase()}  //  FIELD ${fieldNumber} OF 87  //  ${field.columns}×${field.rows}`;
			context.fillText(caption, board.x - padding, captionY);
		}
		context.textAlign = 'right';
		if (floods && !field.isWon) {
			this.#DrawFloodReadout(context, field, padding);
		} else {
			oxygenReadout.Hide();
			if (captionY > 0) {
				const threat = field.isOver ? 'THREAT: CLEARED' : `THREAT: ${field.mineCount} MINES`;
				context.fillText(threat, board.x + board.width + padding, captionY);
			}
		}
	}


	/** Pathos-4: the countdown (and a water gauge beside the board), then the breath readout once flooded. */
	#DrawFloodReadout(context, field, padding) {
		const board = layout.board;
		const viewport = layout.viewport;
		const secondsLeft = Math.max(0, field.floodDuration - (field.clock - field.floodStartTime));
		let html;
		let stateClasses;
		if (!field.isFlooded) {
			const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
			const seconds = String(Math.floor(secondsLeft % 60)).padStart(2, '0');
			html = `FLOODING IN ${minutes}:${seconds}`;
			stateClasses = secondsLeft < TUNING.flood.warningBefore ? 'is-countdown is-alarm' : 'is-countdown';
			const gaugeX = board.x + board.width + padding * 0.35;
			const gaugeWidth = Math.max(3, padding * 0.3);
			context.fillStyle = 'rgba(0,0,0,.5)';
			context.fillRect(gaugeX, board.y, gaugeWidth, board.height);
			context.fillStyle = 'rgba(80,210,240,.8)';
			context.fillRect(gaugeX, board.y + board.height * (1 - field.floodProgress), gaugeWidth, board.height * field.floodProgress);
		} else {
			const breath = oxygenReadout.FormatBreath(field.breathLog10);
			html = (layout.kind === LAYOUT_KIND.WIDE ? 'UNDERWATER · ' : '') + 'BREATH ' + breath;
			stateClasses = '';
		}
		// Leave room for the side panels in the wide and mid layouts
		const reservedWidth = {[LAYOUT_KIND.WIDE]: 680, [LAYOUT_KIND.MID]: 420, [LAYOUT_KIND.NARROW]: 24}[layout.kind];
		const fontSize = layout.kind === LAYOUT_KIND.NARROW ? 48 : 66;
		const centerX = Math.round(board.x + board.width / 2);
		oxygenReadout.Show(html, stateClasses, centerX, Math.round(board.y - padding - 4), fontSize, viewport.width - reservedWidth);
	}


	/** Every tile: hidden (hovered, pressed), flagged, crater, or opened with its number fading in. */
	#DrawTiles(context, field, time, now) {
		const board = layout.board;
		const tileSize = board.tileSize;
		const canHover = !field.isOver && !field.isDead;
		for (let row = 0; row < field.rows; row++) {
			for (let column = 0; column < field.columns; column++) {
				const i = row * field.columns + column;
				const x = board.x + column * tileSize;
				const y = board.y + row * tileSize;
				const state = field.tileStates[i];
				if (state === TILE.HIDDEN) {
					const isUnderCursor = input.keyboardCursorActive && i === field.keyboardCursorTile;
					const isHovered = canHover && (i === field.hoveredTile || isUnderCursor);
					const sprite = i === field.pressedTile ? sprites.open : isHovered ? sprites.hovered : sprites.HiddenSprite(i, column);
					context.drawImage(sprite, x, y, tileSize, tileSize);
				} else if (state === TILE.FLAGGED) {
					const sprite = canHover && i === field.hoveredTile ? sprites.hovered : sprites.HiddenSprite(i, column);
					context.drawImage(sprite, x, y, tileSize, tileSize);
					this.#DrawFlag(context, x, y, time, i);
					// After a win, wrong flags are crossed out
					if (field.isWon && !field.isMine[i]) {
						context.strokeStyle = '#ff3d3d';
						context.lineWidth = 2;
						context.beginPath();
						context.moveTo(x + tileSize * 0.2, y + tileSize * 0.2);
						context.lineTo(x + tileSize * 0.8, y + tileSize * 0.8);
						context.stroke();
					}
				} else if (state === TILE.EXPLODED) {
					context.drawImage(sprites.crater, x, y, tileSize, tileSize);
				} else {
					const revealTime = field.revealTimes[i];
					// Flood fills ripple outwards: tiles further away are still waiting their turn
					if (now < revealTime) {
						context.drawImage(sprites.hidden, x, y, tileSize, tileSize);
						continue;
					}
					this.#DrawOpenTile(context, field, i, x, y, (now - revealTime) / REVEAL_FADE_SECONDS);
				}
				if (input.keyboardCursorActive && i === field.keyboardCursorTile) {
					context.strokeStyle = '#ffd77a';
					context.lineWidth = 2;
					context.strokeRect(x + 1.5, y + 1.5, tileSize - 3, tileSize - 3);
				}
			}
		}
	}


	/** An opened tile; while `progress` < 1 its number fades in and the old cover shrinks away upwards. */
	#DrawOpenTile(context, field, tileIndex, x, y, progress) {
		const tileSize = layout.board.tileSize;
		context.drawImage(sprites.open, x, y, tileSize, tileSize);
		const number = field.adjacentMines[tileIndex];
		if (number) {
			if (progress < 1) {
				context.globalAlpha = progress;
			}
			context.drawImage(sprites.numbers[number], x, y, tileSize, tileSize);
			context.globalAlpha = 1;
		}
		if (progress < 1) {
			const remaining = 1 - progress;
			const coverSize = tileSize * (0.55 + 0.45 * remaining);
			context.globalAlpha = remaining;
			const inset = (tileSize - coverSize) / 2;
			const lift = (1 - remaining) * tileSize * 0.3;
			context.drawImage(sprites.hidden, x + inset, y + inset - lift, coverSize, coverSize);
			context.globalAlpha = 1;
		}
	}


	/** A flag on its little stand, waving, in the equipped skin. */
	#DrawFlag(context, x, y, time, tileIndex) {
		const tileSize = layout.board.tileSize;
		const skin = FLAG_SKINS[profile.equippedSkin] || FLAG_SKINS.red;
		const poleX = x + tileSize * 0.36;
		const top = y + tileSize * 0.18;
		const bottom = y + tileSize * 0.78;
		context.fillStyle = '#0c0f12';
		context.fillRect(x + tileSize * 0.22, bottom, tileSize * 0.44, Math.max(1.5, tileSize * 0.07));
		context.fillRect(x + tileSize * 0.3, bottom - tileSize * 0.04, tileSize * 0.28, tileSize * 0.05);
		context.fillStyle = '#1b2127';
		context.fillRect(poleX - tileSize * 0.025, top, Math.max(1.5, tileSize * 0.05), bottom - top);
		const cloth = context.createLinearGradient(poleX, top, poleX + tileSize * 0.4, top + tileSize * 0.3);
		cloth.addColorStop(0, skin.fillColor);
		cloth.addColorStop(1, skin.outlineColor);
		if (profile.equippedSkin === 'chrome') {
			cloth.addColorStop(0.5, '#9aa7b1');
		}
		context.fillStyle = cloth;
		// The cloth's top and bottom edges ripple with a wave travelling outwards
		const wave = along => Math.sin(time * 7 - along * 4 + tileIndex) * tileSize * 0.035 * along;
		context.beginPath();
		context.moveTo(poleX, top);
		for (let k = 1; k <= FLAG_WAVE_POINTS; k++) {
			const along = k / FLAG_WAVE_POINTS;
			context.lineTo(poleX + along * tileSize * 0.4, top + along * tileSize * 0.15 + wave(along));
		}
		for (let k = FLAG_WAVE_POINTS; k >= 0; k--) {
			const along = k / FLAG_WAVE_POINTS;
			context.lineTo(poleX + along * tileSize * 0.4 * 0.98, top + tileSize * 0.32 - along * tileSize * 0.17 + wave(along));
		}
		context.closePath();
		context.fill();
		if (profile.equippedSkin === 'gold' && Math.sin(time * 4 + tileIndex) > 0.9) {
			context.fillStyle = 'rgba(255,255,255,.9)';
			context.fillRect(poleX + tileSize * 0.2, top + tileSize * 0.12, 2, 2);
		}
	}


	/** Light over the tiles, clipped to the board: a glow around the pointer, a periodic sheen, and the club lights. */
	#DrawLightEffects(context, field, time, cameraX, cameraY) {
		const board = layout.board;
		const tileSize = board.tileSize;
		context.save();
		context.beginPath();
		context.rect(board.x, board.y, board.width, board.height);
		context.clip();
		context.globalCompositeOperation = 'lighter';
		if (field.pointerInCanvas) {
			const pointerX = field.pointerX - cameraX;
			const pointerY = field.pointerY - cameraY;
			const glow = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, tileSize * 5);
			glow.addColorStop(0, 'rgba(255,240,215,.13)');
			glow.addColorStop(1, 'rgba(255,240,215,0)');
			context.fillStyle = glow;
			context.fillRect(board.x, board.y, board.width, board.height);
		}
		const sheenPhase = (time % SHEEN_PERIOD_SECONDS) / SHEEN_PERIOD_SECONDS;
		if (sheenPhase < 0.4) {
			const position = -tileSize * 6 + (board.width + board.height + tileSize * 12) * (sheenPhase / 0.4);
			const startX = board.x + position - board.height;
			const sheen = context.createLinearGradient(startX, board.y, startX + tileSize * 2.4, board.y + tileSize * 1.4);
			sheen.addColorStop(0, 'rgba(255,255,255,0)');
			sheen.addColorStop(0.5, 'rgba(255,255,255,.1)');
			sheen.addColorStop(1, 'rgba(255,255,255,0)');
			context.fillStyle = sheen;
			context.fillRect(board.x, board.y, board.width, board.height);
		}
		if (field.clubSecondsLeft > 0) {
			// Random tiles light up four times a second, and the whole board is tinted in a cycling hue
			const hue = (time * 140) % 360;
			context.globalCompositeOperation = 'lighter';
			const flashFrame = Math.floor(time * 4);
			for (let i = 0; i < field.tileCount; i++) {
				const tileHue = ((i * 2654435761 + flashFrame * 97) >>> 0) % 360;
				if (((i + flashFrame) % 3) === 0) {
					context.fillStyle = `hsla(${tileHue},100%,55%,.22)`;
					context.fillRect(board.x + field.Column(i) * tileSize, board.y + field.Row(i) * tileSize, tileSize, tileSize);
				}
			}
			context.globalCompositeOperation = 'overlay';
			context.fillStyle = `hsla(${hue},100%,50%,.35)`;
			context.fillRect(board.x, board.y, board.width, board.height);
		}
		context.restore();
	}
}


export const boardRenderer = new BoardRenderer();
