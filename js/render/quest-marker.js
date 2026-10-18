/**
 * quest-marker.js: the quest marker over the target tile, and the dotted trail leading the pointer to it.
 */
import {Clamp, FULL_TURN} from '../core/math.js';
import {profile} from '../core/player-profile.js';
import {game} from '../game/game.js';
import {camera} from './camera.js';
import {layout} from './layout.js';


const METRES_PER_TILE = 1.8;     // For the distance readout: a tile is apparently 1.8 m wide
const TRAIL_DOT_SPACING = 15;


/** The glowing beam, pulsing rings and diamond with a distance readout that mark the tile to click. */
export class QuestMarker {
	/** Distance to the target in "metres", from the hovered tile (or the board centre). 0 without a target. */
	Distance() {
		const field = game.field;
		if (field.questTarget < 0) {
			return 0;
		}
		const {column, row} = this.ReferencePoint();
		const dx = field.Column(field.questTarget) - column;
		const dy = field.Row(field.questTarget) - row;
		return Math.max(1, Math.round(Math.hypot(dx, dy) * METRES_PER_TILE));
	}


	/** Where the player "stands": the hovered tile, or the middle of the board. {column, row} in tiles. */
	ReferencePoint() {
		const field = game.field;
		if (field.hoveredTile >= 0) {
			return {column: field.Column(field.hoveredTile), row: field.Row(field.hoveredTile)};
		}
		return {column: (field.columns - 1) / 2, row: (field.rows - 1) / 2};
	}


	/** Draws the marker over the target tile (board space). The Bigger Marker perk makes it 50 % larger. */
	Draw(context, time) {
		const field = game.field;
		if (field.questTarget < 0 || field.isOver || field.isDead) {
			return;
		}
		const tileSize = layout.board.tileSize;
		const x = layout.board.x + (field.Column(field.questTarget) + 0.5) * tileSize;
		const y = layout.board.y + (field.Row(field.questTarget) + 0.5) * tileSize;
		const scale = profile.perks.beacon ? 1.5 : 1;

		context.save();
		context.globalCompositeOperation = 'lighter';
		// The beam rising from the tile
		const beamTop = Math.max(-tileSize * 2, layout.board.y - tileSize * 4);
		const beamWidth = tileSize * 0.5 * scale;
		const beam = context.createLinearGradient(0, y, 0, beamTop);
		beam.addColorStop(0, 'rgba(255,196,70,.36)');
		beam.addColorStop(1, 'rgba(255,196,70,0)');
		context.fillStyle = beam;
		context.fillRect(x - beamWidth / 2, beamTop, beamWidth, y - beamTop);
		const pulse = 0.5 + 0.5 * Math.sin(time * 5);
		context.fillStyle = `rgba(255,190,60,${0.12 + 0.16 * pulse})`;
		context.fillRect(x - tileSize / 2, y - tileSize / 2, tileSize, tileSize);
		// Two rings spreading out, half a cycle apart
		for (let j = 0; j < 2; j++) {
			const progress = ((time * 0.9) + j * 0.5) % 1;
			context.strokeStyle = `rgba(255,205,90,${(1 - progress) * 0.9})`;
			context.lineWidth = 2;
			context.beginPath();
			context.arc(x, y, tileSize * (0.42 + progress * 1.1) * scale, 0, FULL_TURN);
			context.stroke();
		}
		context.restore();

		// The bobbing diamond with the distance above it
		const diamond = Math.max(7, tileSize * 0.27) * scale;
		const diamondY = y - tileSize * 0.95 * scale - 8 - Math.sin(time * 3) * 3;
		context.save();
		context.shadowColor = 'rgba(255,180,40,.95)';
		context.shadowBlur = 14;
		context.fillStyle = '#ffc94a';
		this.#FillDiamond(context, x, diamondY, diamond * 0.72, diamond);
		context.shadowBlur = 0;
		context.fillStyle = '#3a2600';
		this.#FillDiamond(context, x, diamondY, diamond * 0.32, diamond * 0.45);
		const fontSize = Math.round(Clamp(tileSize * 0.4, 10, 15) * (scale > 1 ? 1.15 : 1));
		context.font = `700 ${fontSize}px "Chakra Petch", sans-serif`;
		context.textAlign = 'center';
		context.lineWidth = 3;
		context.strokeStyle = 'rgba(0,0,0,.65)';
		const label = `${this.Distance()} m`;
		context.strokeText(label, x, diamondY - diamond - 5);
		context.fillStyle = '#ffd77a';
		context.fillText(label, x, diamondY - diamond - 5);
		context.restore();
	}


	/** Dots flowing along a curve from the mouse pointer to the target, when the pointer is far from it. */
	DrawTrail(context, time) {
		const field = game.field;
		if (field.questTarget < 0 || !field.pointerInCanvas || field.isOver || field.isDead || field.pointerIsTouch) {
			return;
		}
		const target = camera.TileToScreen(field.questTarget);
		const startX = field.pointerX - camera.x;
		const startY = field.pointerY - camera.y;
		const endX = target.x - camera.x;
		const endY = target.y - camera.y;
		const dx = endX - startX;
		const dy = endY - startY;
		const length = Math.hypot(dx, dy);
		if (length < layout.board.tileSize * 1.6) {
			return;
		}
		// A quadratic curve bending to one side of the straight line
		const controlX = (startX + endX) / 2 - dy * 0.22;
		const controlY = (startY + endY) / 2 + dx * 0.22;
		const dots = Math.floor(length / TRAIL_DOT_SPACING);
		context.save();
		context.globalCompositeOperation = 'lighter';
		const flow = (time * 2.2) % 1;
		for (let k = 0; k < dots; k++) {
			const along = (k + flow) / dots;    // Position on the curve, 0..1
			if (along > 1) {
				continue;
			}
			const remaining = 1 - along;
			const x = remaining * remaining * startX + 2 * remaining * along * controlX + along * along * endX;
			const y = remaining * remaining * startY + 2 * remaining * along * controlY + along * along * endY;
			context.fillStyle = `rgba(255,205,100,${Math.sin(Math.PI * along) * 0.55})`;
			context.beginPath();
			context.arc(x, y, 2.1, 0, FULL_TURN);
			context.fill();
		}
		context.restore();
	}


	/** Fills a diamond centred on (x, y). */
	#FillDiamond(context, x, y, halfWidth, halfHeight) {
		context.beginPath();
		context.moveTo(x, y - halfHeight);
		context.lineTo(x + halfWidth, y);
		context.lineTo(x, y + halfHeight);
		context.lineTo(x - halfWidth, y);
		context.closePath();
		context.fill();
	}
}


export const questMarker = new QuestMarker();
