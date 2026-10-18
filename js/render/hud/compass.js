/**
 * compass.js: the compass strip at the top of the HUD, with markers for the quest, supply drops and side quests.
 */
import {FindElement} from '../../core/dom.js';
import {Clamp} from '../../core/math.js';
import {CHARACTERS} from '../../data/characters.js';
import {SIDE_QUESTS} from '../../data/side-quests.js';
import {game} from '../../game/game.js';
import {layout} from '../layout.js';
import {questMarker} from '../quest-marker.js';


const CARDINAL_LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const STRIP_HEIGHT = 26;


/**
 * A heading strip that drifts with the mouse (as if the player turned their head). Points of interest show as
 * diamonds at their bearing, or as arrows at the edge when they are out of view.
 */
export class Compass {
	/** Draws the compass for this frame. */
	Draw(time) {
		const canvas = FindElement('#compass-canvas');
		const context = canvas.getContext('2d');
		const pixelRatio = layout.viewport.pixelRatio;
		const width = canvas.width / pixelRatio;
		const height = canvas.height / pixelRatio;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		context.clearRect(0, 0, width, height);
		const field = game.field;
		const lookOffset = field.pointerInCanvas ? (field.pointerX / layout.viewport.width - 0.5) : 0;
		const heading = (lookOffset * 70 + Math.sin(time * 0.13) * 4 + 360) % 360;
		const span = width < 300 ? 90 : 110;      // Degrees visible on the strip
		const pixelsPerDegree = width / span;

		context.fillStyle = 'rgba(5,9,13,.55)';
		context.fillRect(0, 0, width, STRIP_HEIGHT);
		context.strokeStyle = 'rgba(233,238,242,.5)';
		context.lineWidth = 1;
		context.textAlign = 'center';
		const firstDegree = Math.floor((heading - span / 2) / 5) * 5;
		for (let degree = firstDegree; degree <= heading + span / 2 + 5; degree += 5) {
			this.#DrawTick(context, width / 2 + (degree - heading) * pixelsPerDegree, ((degree % 360) + 360) % 360);
		}
		// The heading pointer
		context.fillStyle = '#ffd77a';
		context.beginPath();
		context.moveTo(width / 2 - 5, 0);
		context.lineTo(width / 2 + 5, 0);
		context.lineTo(width / 2, 5);
		context.closePath();
		context.fill();

		for (const point of this.#PointsOfInterest(time)) {
			this.#DrawPointOfInterest(context, point, heading, span, width, height, pixelsPerDegree);
		}
	}


	/** One tick: cardinal labels every 45°, small numbers every 15°, short ticks every 5°. */
	#DrawTick(context, x, degree) {
		let tickLength = 4;
		if (degree % 45 === 0) {
			tickLength = 0;
			context.fillStyle = degree === 0 ? '#ffcf5a' : 'rgba(233,238,242,.95)';
			context.font = (degree % 90 === 0 ? '700 13px' : '600 11px') + ' "Chakra Petch", sans-serif';
			context.fillText(CARDINAL_LABELS[degree / 45], x, 17);
		} else if (degree % 15 === 0) {
			tickLength = 8;
			context.fillStyle = 'rgba(233,238,242,.45)';
			context.font = '500 9px "Chakra Petch", sans-serif';
			context.fillText(String(degree), x, 13);
		}
		if (tickLength) {
			context.beginPath();
			context.moveTo(Math.round(x) + 0.5, STRIP_HEIGHT);
			context.lineTo(Math.round(x) + 0.5, STRIP_HEIGHT - tickLength);
			context.stroke();
		}
	}


	/** The quest target, the supply drop and every side quest: {bearing, color, label, isBig}. */
	#PointsOfInterest(time) {
		const field = game.field;
		const points = [];
		if (field.questTarget >= 0 && !field.isOver) {
			points.push({bearing: this.#BearingTo(field.questTarget), color: '#ffc94a', label: `${questMarker.Distance()} m`, isBig: true});
		}
		if (field.supplyCrate) {
			points.push({bearing: this.#BearingTo(field.supplyCrate.tile), color: '#6fb6ff', label: 'DROP'});
		}
		for (const questId of field.sideQuests) {
			const quest = SIDE_QUESTS[questId];
			// The whisperer's signal never holds still
			const bearing = questId === 'whisper' ? (time * 37) % 360 : quest.bearing;
			points.push({bearing, color: CHARACTERS[quest.speaker].color, label: quest.distance});
		}
		return points;
	}


	/** A diamond under the strip, or an arrow at the edge when the point is outside the visible span. */
	#DrawPointOfInterest(context, point, heading, span, width, height, pixelsPerDegree) {
		let relative = ((point.bearing - heading + 540) % 360) - 180;
		const isOutOfView = Math.abs(relative) > span / 2 - 4;
		relative = Clamp(relative, -span / 2 + 4, span / 2 - 4);
		const x = width / 2 + relative * pixelsPerDegree;
		const y = 31;
		const size = point.isBig ? 6 : 4;
		context.fillStyle = point.color;
		context.beginPath();
		if (isOutOfView) {
			const direction = Math.sign(relative);
			context.moveTo(x + direction * size, y);
			context.lineTo(x - direction * size * 0.6, y - size);
			context.lineTo(x - direction * size * 0.6, y + size);
		} else {
			context.moveTo(x, y - size);
			context.lineTo(x + size * 0.75, y);
			context.lineTo(x, y + size);
			context.lineTo(x - size * 0.75, y);
		}
		context.closePath();
		context.fill();
		// Labels only fit on the taller compass
		if (height >= 44) {
			context.font = '600 9px "Chakra Petch", sans-serif';
			context.fillText(point.label, x, y + size + 8);
		}
	}


	/** Bearing in degrees (0 = up) from the player's reference point to a tile. */
	#BearingTo(tileIndex) {
		const field = game.field;
		const {column, row} = questMarker.ReferencePoint();
		const dx = field.Column(tileIndex) - column;
		const dy = field.Row(tileIndex) - row;
		return (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
	}
}


export const compass = new Compass();
