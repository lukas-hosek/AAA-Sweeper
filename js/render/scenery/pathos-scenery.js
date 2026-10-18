/**
 * pathos-scenery.js: Pathos-4, the underwater base: portholes with fish, pipes, an alarm, leaks and rising water.
 */
import {FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {game} from '../../game/game.js';
import {underwater} from '../underwater.js';
import {Scenery} from './scenery.js';


const WATER_STEP = 10;    // The water surface is sampled every 10 CSS pixels


/** The water level follows the flood countdown of the field being played (35 % full on the concept art). */
export class PathosScenery extends Scenery {
	#portholes = [];    // {x, y, radius}
	#fish = [];         // Fish swimming past the portholes: {porthole, position, y, speed, size}
	#drips = [];        // Leaking drops falling from the ceiling: {x, y, velocity, wait}


	Build(width, height) {
		this.baked = this.Bake(width, height, context => {
			const wall = context.createLinearGradient(0, 0, 0, height);
			wall.addColorStop(0, '#0e1f25');
			wall.addColorStop(0.6, '#0a171b');
			wall.addColorStop(1, '#050b0d');
			context.fillStyle = wall;
			context.fillRect(0, 0, width, height);
			// Hull ribs and the deck lines
			context.strokeStyle = 'rgba(150,210,210,.06)';
			context.lineWidth = 2;
			for (let x = 60; x < width; x += 140) {
				context.beginPath();
				context.moveTo(x, height * 0.13);
				context.lineTo(x, height * 0.86);
				context.stroke();
			}
			for (const y of [height * 0.13, height * 0.86]) {
				context.fillStyle = 'rgba(150,210,210,.07)';
				context.fillRect(0, y, width, 3);
			}
			const radius = Math.max(34, Math.min(width, height) * 0.085);
			const positions = [[width * 0.07, height * 0.44], [width * 0.93, height * 0.44], [width * 0.07, height * 0.7],
				[width * 0.93, height * 0.7], [width * 0.3, height * 0.3], [width * 0.7, height * 0.3]];
			this.#portholes = positions.map(([x, y]) => ({x, y, radius}));
			for (const porthole of this.#portholes) {
				this.#PaintPorthole(context, porthole);
			}
			this.#PaintPipe(context, width, height * 0.05, 10);
			this.#PaintPipe(context, width, height * 0.09, 6);
			this.#PaintPipe(context, width, height * 0.93, 9);
			this.#PaintValves(context, width, height);
			this.#PaintHazardStripe(context, width, height);
			// Deck plating
			context.strokeStyle = 'rgba(140,190,190,.08)';
			context.lineWidth = 1;
			for (let x = 0; x < width; x += 12) {
				context.beginPath();
				context.moveTo(x, height * 0.87 + 4);
				context.lineTo(x + 6, height);
				context.stroke();
			}
			context.font = '700 13px "Chakra Petch",sans-serif';
			context.fillStyle = 'rgba(210,230,220,.32)';
			context.textAlign = 'left';
			context.fillText('PATHOS-4 · DECK C · −300 M', width * 0.03, height * 0.18);
			context.textAlign = 'right';
			context.fillText('WATERTIGHT DOOR 7 · KEEP CLOSED', width * 0.97, height * 0.18);
			context.textAlign = 'left';
		});
		this.#fish = Array.from({length: 14}, (_, i) => ({
			porthole: i % 6,
			position: random.Next(),
			y: random.Range(-0.6, 0.6),
			speed: random.Range(0.03, 0.09) * (random.Next() < 0.5 ? 1 : -1),
			size: random.Range(0.12, 0.28),
		}));
		// Air bubbles rising in the water
		this.particles = Array.from({length: 60}, () => ({
			x: random.Range(0, width),
			y: random.Range(0, height),
			velocityY: -random.Range(15, 45),
			size: random.Range(1, 3.5),
			phase: random.Range(0, 6),
		}));
		this.#drips = Array.from({length: 10}, () => ({x: random.Range(0, width), y: height * 0.1, velocity: 0, wait: random.Range(0, 4)}));
	}


	Draw(context, width, height, time, deltaTime) {
		context.drawImage(this.baked, 0, 0, width, height);
		const field = game.field;
		const isPathos = field && field.chapter.floods;
		const floodProgress = isPathos ? field.floodProgress : 0.35;
		const isFlooded = isPathos && field.isFlooded;
		this.#portholes.forEach((porthole, index) => this.#DrawPortholeView(context, porthole, index, time, deltaTime));
		const waterLevel = isFlooded ? -20 : height * (1 - 0.92 * floodProgress);
		if (!isFlooded) {
			this.#DrawAlarmAndDrips(context, width, height, time, deltaTime, waterLevel);
		}
		const waveY = x => waterLevel + Math.sin(x * 0.02 + time * 2) * 4 + Math.sin(x * 0.05 - time * 3) * 2;
		context.save();
		context.beginPath();
		context.moveTo(0, height);
		for (let x = 0; x <= width + WATER_STEP; x += WATER_STEP) {
			context.lineTo(x, waveY(x));
		}
		context.lineTo(width, height);
		context.closePath();
		const water = context.createLinearGradient(0, Math.max(0, waterLevel), 0, height);
		water.addColorStop(0, 'rgba(30,130,150,.38)');
		water.addColorStop(1, 'rgba(5,40,60,.62)');
		context.fillStyle = water;
		context.fill();
		// Everything below happens inside the water
		context.clip();
		context.globalCompositeOperation = 'lighter';
		context.globalAlpha = 0.08;
		const caustics = underwater.causticsTexture;
		const tileSize = 512;
		const offsetX = ((time * 14) % tileSize + tileSize) % tileSize;
		const offsetY = ((time * 6) % tileSize + tileSize) % tileSize;
		for (let x = -offsetX; x < width; x += tileSize) {
			for (let y = -offsetY; y < height; y += tileSize) {
				context.drawImage(caustics, x, y, tileSize, tileSize);
			}
		}
		context.globalAlpha = 1;
		context.globalCompositeOperation = 'source-over';
		context.strokeStyle = 'rgba(200,245,255,.45)';
		context.lineWidth = 1;
		for (const bubble of this.particles) {
			bubble.y += bubble.velocityY * deltaTime;
			bubble.x += Math.sin(time * 2 + bubble.phase) * 0.3;
			if (bubble.y < waterLevel + 4) {
				bubble.y = height + 5;
				bubble.x = random.Range(0, width);
			}
			context.beginPath();
			context.arc(bubble.x, bubble.y, bubble.size, 0, FULL_TURN);
			context.stroke();
		}
		context.restore();
		if (!isFlooded) {
			// The surface line
			context.strokeStyle = 'rgba(190,245,255,.55)';
			context.lineWidth = 1.5;
			context.beginPath();
			for (let x = 0; x <= width + WATER_STEP; x += WATER_STEP) {
				const y = waveY(x);
				if (x) {
					context.lineTo(x, y);
				} else {
					context.moveTo(x, y);
				}
			}
			context.stroke();
		}
	}


	/** A porthole: a shaded metal ring, deep blue glass and twelve bolts. */
	#PaintPorthole(context, porthole) {
		const {x, y, radius} = porthole;
		const ring = context.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.2, x, y, radius * 1.25);
		ring.addColorStop(0, '#6d8c8f');
		ring.addColorStop(1, '#1d2d30');
		context.fillStyle = ring;
		context.beginPath();
		context.arc(x, y, radius * 1.22, 0, FULL_TURN);
		context.fill();
		const glass = context.createLinearGradient(0, y - radius, 0, y + radius);
		glass.addColorStop(0, '#0f4a6a');
		glass.addColorStop(1, '#03141f');
		context.fillStyle = glass;
		context.beginPath();
		context.arc(x, y, radius, 0, FULL_TURN);
		context.fill();
		context.fillStyle = '#1a2629';
		for (let k = 0; k < 12; k++) {
			const angle = k / 12 * 6.283;
			context.beginPath();
			context.arc(x + Math.cos(angle) * radius * 1.11, y + Math.sin(angle) * radius * 1.11, radius * 0.045, 0, FULL_TURN);
			context.fill();
		}
	}


	/** A horizontal pipe with clamps. */
	#PaintPipe(context, width, y, radius) {
		const pipe = context.createLinearGradient(0, y - radius, 0, y + radius);
		pipe.addColorStop(0, '#5d7376');
		pipe.addColorStop(0.5, '#2c3c3f');
		pipe.addColorStop(1, '#141d1f');
		context.fillStyle = pipe;
		context.fillRect(0, y - radius, width, 2 * radius);
		context.fillStyle = 'rgba(0,0,0,.4)';
		for (let x = 80; x < width; x += 220) {
			context.fillRect(x, y - radius - 2, 10, 2 * radius + 4);
		}
	}


	/** Two red valve wheels on the top pipe. */
	#PaintValves(context, width, height) {
		context.strokeStyle = '#a34a2a';
		context.lineWidth = 3;
		for (const x of [width * 0.2, width * 0.8]) {
			const y = height * 0.05;
			context.beginPath();
			context.arc(x, y, 14, 0, FULL_TURN);
			context.stroke();
			context.beginPath();
			context.moveTo(x - 14, y);
			context.lineTo(x + 14, y);
			context.moveTo(x, y - 14);
			context.lineTo(x, y + 14);
			context.stroke();
		}
	}


	/** A yellow and black hazard stripe along the deck edge. */
	#PaintHazardStripe(context, width, height) {
		const y = height * 0.86;
		context.save();
		context.beginPath();
		context.rect(0, y, width, 10);
		context.clip();
		context.fillStyle = '#c9a227';
		context.fillRect(0, y, width, 10);
		context.fillStyle = '#1a1a1a';
		for (let x = -20; x < width + 20; x += 24) {
			context.beginPath();
			context.moveTo(x, y + 10);
			context.lineTo(x + 12, y);
			context.lineTo(x + 24, y);
			context.lineTo(x + 12, y + 10);
			context.closePath();
			context.fill();
		}
		context.restore();
	}


	/** The view through one porthole: fish swimming past, glowing plankton, a reflection on the glass. */
	#DrawPortholeView(context, porthole, index, time, deltaTime) {
		const {x, y, radius} = porthole;
		context.save();
		context.beginPath();
		context.arc(x, y, radius, 0, FULL_TURN);
		context.clip();
		for (const fish of this.#fish) {
			if (fish.porthole !== index) {
				continue;
			}
			fish.position = (fish.position + fish.speed * deltaTime + 1) % 1;
			const fishX = x - radius * 1.4 + fish.position * radius * 2.8;
			const fishY = y + fish.y * radius + Math.sin(time + fish.position * 9) * 3;
			const fishSize = radius * fish.size;
			const direction = Math.sign(fish.speed);
			context.fillStyle = 'rgba(2,10,16,.75)';
			context.beginPath();
			context.ellipse(fishX, fishY, fishSize, fishSize * 0.45, 0, 0, FULL_TURN);
			context.fill();
			context.beginPath();
			context.moveTo(fishX - direction * fishSize * 0.9, fishY);
			context.lineTo(fishX - direction * fishSize * 1.5, fishY - fishSize * 0.4);
			context.lineTo(fishX - direction * fishSize * 1.5, fishY + fishSize * 0.4);
			context.closePath();
			context.fill();
		}
		context.globalCompositeOperation = 'lighter';
		for (let k = 0; k < 6; k++) {
			const angle = time * 0.3 + k * 1.1 + index * 2;
			context.fillStyle = `rgba(80,255,220,${0.25 + 0.2 * Math.sin(time * 2 + k)})`;
			context.beginPath();
			context.arc(x + Math.cos(angle) * radius * 0.6, y + Math.sin(angle * 1.3) * radius * 0.6, 1.6, 0, FULL_TURN);
			context.fill();
		}
		const shine = context.createLinearGradient(x - radius, y - radius, x, y);
		shine.addColorStop(0, 'rgba(160,230,255,.18)');
		shine.addColorStop(1, 'rgba(160,230,255,0)');
		context.fillStyle = shine;
		context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
		context.restore();
		context.strokeStyle = 'rgba(220,250,255,.25)';
		context.lineWidth = 2;
		context.beginPath();
		context.arc(x, y, radius * 0.82, Math.PI * 1.1, Math.PI * 1.45);
		context.stroke();
	}


	/** Before the flood: the room pulses red, the alarm light blinks, and drops leak from the ceiling. */
	#DrawAlarmAndDrips(context, width, height, time, deltaTime, waterLevel) {
		const alarm = (Math.sin(time * 4) + 1) / 2;
		context.fillStyle = `rgba(255,30,20,${0.04 + 0.08 * alarm})`;
		context.fillRect(0, 0, width, height);
		context.fillStyle = `rgba(255,60,40,${0.5 + 0.5 * alarm})`;
		context.beginPath();
		context.arc(width / 2, height * 0.05, 6, 0, FULL_TURN);
		context.fill();
		context.fillStyle = 'rgba(170,230,255,.6)';
		for (const drip of this.#drips) {
			if (drip.wait > 0) {
				drip.wait -= deltaTime;
				continue;
			}
			drip.velocity += 500 * deltaTime;
			drip.y += drip.velocity * deltaTime;
			context.fillRect(drip.x, drip.y, 1.5, 5);
			if (drip.y > waterLevel) {
				drip.y = height * 0.1;
				drip.velocity = 0;
				drip.wait = random.Range(1, 5);
				drip.x = random.Range(0, width);
			}
		}
	}
}
