/**
 * desert-scenery.js: The Dune Sea: dunes, ruins, palms, heat shimmer, circling birds and occasional sandstorms.
 */
import {Clamp} from '../../core/math.js';
import {random} from '../../core/random.js';
import {layout} from '../layout.js';
import {Scenery} from './scenery.js';


const HORIZON = 0.6;
const DUNE_STEP = 8;    // Dune outlines are sampled every 8 CSS pixels


/** A hot blue sky over layered dunes; sand blows across the screen and a sandstorm rolls in now and then. */
export class DesertScenery extends Scenery {
	#birds = [];    // Two birds circling: {centerX, centerY, radius, phase}


	Build(width, height) {
		const horizon = height * HORIZON;
		this.baked = this.Bake(width, height, context => {
			const sky = context.createLinearGradient(0, 0, 0, horizon);
			sky.addColorStop(0, '#2a5784');
			sky.addColorStop(0.55, '#86aec6');
			sky.addColorStop(1, '#f2d7a6');
			context.fillStyle = sky;
			context.fillRect(0, 0, width, height);
			const sunX = width * 0.7;
			const sunY = height * 0.15;
			const glow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(width, height) * 0.5);
			glow.addColorStop(0, 'rgba(255,250,225,.75)');
			glow.addColorStop(0.12, 'rgba(255,236,190,.3)');
			glow.addColorStop(1, 'rgba(255,220,160,0)');
			context.fillStyle = glow;
			context.fillRect(0, 0, width, height);
			this.#PaintMesas(context, width, horizon);
			this.#PaintRuins(context, width, horizon);
			this.#PaintDune(context, width, height, horizon + 6, 10, 160, '#e8c995', '#d2a86f');
			this.#PaintPalm(context, width * 0.05, horizon + 12, 70, 8, 'rgba(70,56,36,.85)');
			this.#PaintPalm(context, width * 0.09, horizon + 16, 52, -6, 'rgba(70,56,36,.85)');
			this.#PaintPalm(context, width * 0.94, horizon + 10, 64, -10, 'rgba(70,56,36,.85)');
			this.#PaintDune(context, width, height, horizon + 40, 16, 220, '#e2b97f', '#c1915a');
			this.#PaintDune(context, width, height, horizon + 92, 22, 300, '#d7a96c', '#a8773f');
			this.#PaintDune(context, width, height, horizon + 172, 30, 380, '#c89255', '#8a5a2c');
			// Wind ripples in the near sand
			context.strokeStyle = 'rgba(110,70,35,.13)';
			context.lineWidth = 1;
			for (let k = 0; k < 60; k++) {
				const x = random.Range(0, width);
				const y = random.Range(horizon + 110, height);
				context.beginPath();
				context.moveTo(x, y);
				context.quadraticCurveTo(x + 20, y - 4, x + 44, y + 1);
				context.stroke();
			}
		});
		const grainCount = Math.round(Clamp(width * height / 9000, 40, 200));
		this.particles = Array.from({length: grainCount}, () => ({
			x: random.Range(0, width),
			y: random.Range(height * 0.3, height),
			velocityX: random.Range(140, 380),
			velocityY: random.Range(-8, 8),
			size: random.Range(0.6, 1.8),
			alpha: random.Range(0.2, 0.6),
		}));
		this.#birds = [
			{centerX: width * 0.2, centerY: height * 0.2, radius: 46, phase: 0},
			{centerX: width * 0.24, centerY: height * 0.24, radius: 30, phase: 2},
		];
	}


	Draw(context, width, height, time, deltaTime) {
		context.drawImage(this.baked, 0, 0, width, height);
		const horizon = height * HORIZON;
		const pixelRatio = layout.viewport.pixelRatio;
		// Heat shimmer: redraw thin strips around the horizon, each shifted sideways by a wave
		for (let y = Math.floor(horizon - 36); y < horizon + 16; y += 4) {
			const shift = Math.sin(y * 0.35 + time * 4) * 1.3;
			context.drawImage(this.baked, 0, y * pixelRatio, this.baked.width, 4 * pixelRatio, shift, y, width, 4);
		}
		this.DrawSunFlare(context, width, height, width * 0.7, height * 0.15, 0.9, false);
		context.strokeStyle = 'rgba(40,30,25,.75)';
		context.lineWidth = 1.6;
		for (const bird of this.#birds) {
			const angle = time * 0.4 + bird.phase;
			const x = bird.centerX + Math.cos(angle) * bird.radius * 1.6;
			const y = bird.centerY + Math.sin(angle) * bird.radius * 0.5;
			this.DrawBirdV(context, x, y, Math.sin(time * 6 + bird.phase) * 3);
		}
		// A sandstorm builds up for a while every 90 seconds or so
		const storm = Math.pow(Math.max(0, Math.sin(time * 0.07)), 6);
		for (const grain of this.particles) {
			grain.x += grain.velocityX * deltaTime * (1 + storm * 1.6);
			grain.y += grain.velocityY * deltaTime;
			if (grain.x > width + 10) {
				grain.x = -10;
				grain.y = random.Range(height * 0.3, height);
			}
			context.fillStyle = `rgba(236,206,156,${Clamp(grain.alpha * (0.5 + storm), 0, 1)})`;
			context.fillRect(grain.x, grain.y, grain.size * 3, grain.size);
		}
		if (storm > 0.02) {
			context.fillStyle = `rgba(214,170,110,${storm * 0.38})`;
			context.fillRect(0, 0, width, height);
		}
	}


	/** Four flat-topped mesas on the horizon. */
	#PaintMesas(context, width, horizon) {
		context.fillStyle = 'rgba(183,139,104,.55)';
		for (let k = 0; k < 4; k++) {
			const left = random.Range(-60, width);
			const mesaWidth = random.Range(120, 320);
			const mesaHeight = random.Range(35, 90);
			const slope = random.Range(15, 40);
			context.beginPath();
			context.moveTo(left, horizon + 4);
			context.lineTo(left + slope, horizon - mesaHeight);
			context.lineTo(left + mesaWidth - slope, horizon - mesaHeight + random.Range(-6, 6));
			context.lineTo(left + mesaWidth, horizon + 4);
			context.closePath();
			context.fill();
		}
	}


	/** An arched gate with a broken colonnade, and a domed shrine with a minaret. */
	#PaintRuins(context, width, horizon) {
		context.fillStyle = 'rgba(160,116,76,.92)';
		const base = horizon + 6;
		const gateX = width * 0.16;
		this.#PaintArchGate(context, gateX, base, 70, 92);
		for (let k = 0; k < 5; k++) {
			const columnX = gateX + 100 + k * 24;
			const columnHeight = random.Range(22, 72);
			context.fillRect(columnX, base - columnHeight, 10, columnHeight);
			context.fillRect(columnX - 3, base - columnHeight - 4, 16, 5);
		}
		const shrineX = width * 0.7;
		context.fillRect(shrineX, base - 40, 64, 40);
		context.beginPath();
		context.ellipse(shrineX + 32, base - 40, 27, 25, 0, Math.PI, 0);
		context.fill();
		context.fillRect(shrineX + 30, base - 74, 4, 12);
		context.fillRect(shrineX + 80, base - 60, 12, 60);
		context.beginPath();
		context.moveTo(shrineX + 80, base - 60);
		context.lineTo(shrineX + 86, base - 74);
		context.lineTo(shrineX + 92, base - 60);
		context.fill();
	}


	/** A solid block with a round arch cut through it. */
	#PaintArchGate(context, x, base, gateWidth, gateHeight) {
		const pillar = gateWidth * 0.22;
		context.beginPath();
		context.moveTo(x, base);
		context.lineTo(x, base - gateHeight);
		context.lineTo(x + gateWidth, base - gateHeight);
		context.lineTo(x + gateWidth, base);
		context.lineTo(x + gateWidth - pillar, base);
		context.lineTo(x + gateWidth - pillar, base - gateHeight * 0.55);
		context.arc(x + gateWidth / 2, base - gateHeight * 0.55, (gateWidth - 2 * pillar) / 2, 0, Math.PI, true);
		context.lineTo(x + pillar, base);
		context.closePath();
		context.fill();
	}


	/** A palm tree leaning by `lean`: a curved trunk and eight fronds. */
	#PaintPalm(context, x, base, palmHeight, lean, color) {
		context.strokeStyle = color;
		context.lineCap = 'round';
		context.lineWidth = Math.max(2, palmHeight * 0.045);
		const topX = x + lean;
		const topY = base - palmHeight;
		context.beginPath();
		context.moveTo(x, base);
		context.quadraticCurveTo(x + lean * 0.15, base - palmHeight * 0.5, topX, topY);
		context.stroke();
		context.lineWidth = Math.max(1.4, palmHeight * 0.028);
		for (let k = 0; k < 8; k++) {
			const angle = -Math.PI / 2 + (k - 3.5) * 0.42;
			const length = palmHeight * random.Range(0.32, 0.46);
			const endX = topX + Math.cos(angle) * length * 1.1;
			const endY = topY + Math.sin(angle) * length * 0.5 + length * 0.38;
			context.beginPath();
			context.moveTo(topX, topY);
			const bendX = topX + Math.cos(angle) * length * 0.6;
			const bendY = topY + Math.sin(angle) * length * 0.6 - length * 0.12;
			context.quadraticCurveTo(bendX, bendY, endX, endY);
			context.stroke();
		}
	}


	/** One dune band: a wavy outline filled with a gradient and lit along its crest. */
	#PaintDune(context, width, height, base, amplitude, wavelength, topColor, bottomColor) {
		const phase = random.Range(0, 6);
		// Two sine waves: the long dune shape plus a shorter ripple on top
		const crestY = x => base + Math.sin(x / wavelength + phase) * amplitude
			+ Math.sin(x / (wavelength * 0.37) + phase * 2) * amplitude * 0.35;
		context.beginPath();
		context.moveTo(0, height);
		for (let x = 0; x <= width + DUNE_STEP; x += DUNE_STEP) {
			context.lineTo(x, crestY(x));
		}
		context.lineTo(width, height);
		context.closePath();
		const fill = context.createLinearGradient(0, base - amplitude, 0, base + amplitude * 3 + 40);
		fill.addColorStop(0, topColor);
		fill.addColorStop(1, bottomColor);
		context.fillStyle = fill;
		context.fill();
		context.strokeStyle = 'rgba(255,244,215,.35)';
		context.lineWidth = 1.2;
		context.beginPath();
		for (let x = 0; x <= width + DUNE_STEP; x += DUNE_STEP) {
			const y = crestY(x);
			if (x) {
				context.lineTo(x, y);
			} else {
				context.moveTo(x, y);
			}
		}
		context.stroke();
	}
}
