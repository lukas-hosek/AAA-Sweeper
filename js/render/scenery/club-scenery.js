/**
 * club-scenery.js: Da Club: lights and lasers on the beat, a mirror ball, neon signs, the DJ booth and a dancing crowd.
 */
import {FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {Scenery} from './scenery.js';


const BEATS_PER_SECOND = 124 / 60;    // The club music's tempo
const FLOOR = 0.72;                   // Dance floor edge as a fraction of the screen height
const CROWD_SPACING = 26;


/** Everything moves to the 124 BPM music; every 16th beat the whole room flashes. */
export class ClubScenery extends Scenery {
	#crowd = [];    // Dancers along the bottom: {x, y, scale, phase, hasArmsUp}


	Build(width, height) {
		const floor = height * FLOOR;
		this.baked = this.Bake(width, height, context => {
			const wall = context.createLinearGradient(0, 0, 0, height);
			wall.addColorStop(0, '#0a0513');
			wall.addColorStop(0.7, '#160b28');
			wall.addColorStop(0.72, '#05030a');
			wall.addColorStop(1, '#0c0716');
			context.fillStyle = wall;
			context.fillRect(0, 0, width, height);
			// Acoustic panel dots
			context.fillStyle = 'rgba(255,255,255,.045)';
			for (let y = 20; y < floor - 20; y += 14) {
				for (let x = 10; x < width; x += 14) {
					context.fillRect(x, y, 3, 3);
				}
			}
			const speakerWidth = Math.max(50, width * 0.05);
			this.#PaintSpeaker(context, width * 0.02, floor - speakerWidth * 3.6, speakerWidth, speakerWidth * 3.6);
			this.#PaintSpeaker(context, width * 0.02 + speakerWidth + 4, floor - speakerWidth * 2.7, speakerWidth, speakerWidth * 2.7);
			this.#PaintSpeaker(context, width * 0.98 - speakerWidth, floor - speakerWidth * 3.6, speakerWidth, speakerWidth * 3.6);
			this.#PaintSpeaker(context, width * 0.98 - 2 * speakerWidth - 4, floor - speakerWidth * 2.7, speakerWidth, speakerWidth * 2.7);
			context.fillStyle = 'rgba(255,255,255,.06)';
			context.fillRect(0, floor, width, 1);
		});
		this.#crowd = [];
		const dancers = Math.round(width / CROWD_SPACING);
		for (let k = 0; k <= dancers; k++) {
			this.#crowd.push({
				x: (k + random.Range(-0.3, 0.3)) * CROWD_SPACING,
				y: height - random.Range(0, 26),
				scale: random.Range(0.8, 1.25),
				phase: random.Range(0, 1),
				hasArmsUp: random.Next() < 0.3,
			});
		}
		// Mirror-ball sparkles travelling across the walls
		this.particles = Array.from({length: 44}, () => ({
			position: random.Next(),
			y: random.Range(height * 0.05, height * 0.95),
			radius: random.Range(1.5, 3.5),
		}));
	}


	Draw(context, width, height, time, deltaTime) {
		context.drawImage(this.baked, 0, 0, width, height);
		const beat = time * BEATS_PER_SECOND;
		const beatPhase = beat % 1;
		const pulse = Math.exp(-beatPhase * 5);
		const bar = Math.floor(beat / 4);
		const floor = height * FLOOR;
		context.globalCompositeOperation = 'lighter';
		this.#DrawWashLights(context, width, height, time, pulse, floor);
		this.#DrawLasers(context, width, height, time, pulse, bar);
		for (const sparkle of this.particles) {
			const x = ((sparkle.position + time * 0.035) % 1) * width;
			context.fillStyle = `rgba(255,255,255,${0.12 + 0.1 * Math.sin(time * 3 + sparkle.y)})`;
			context.beginPath();
			context.arc(x, sparkle.y, sparkle.radius, 0, FULL_TURN);
			context.fill();
		}
		context.globalCompositeOperation = 'source-over';
		this.#DrawMirrorBall(context, width);
		this.#DrawNeon(context, 'DA CLUB', width * 0.1, height * 0.44, Math.max(24, width * 0.027), '255,70,200', time);
		this.#DrawNeon(context, 'VIP', width * 0.1, height * 0.33, Math.max(20, width * 0.02), '80,230,255', time + 1.3);
		this.#DrawDjBooth(context, width, floor, pulse);
		const hue = (time * 40) % 360;
		const floorGlow = context.createLinearGradient(0, height * 0.82, 0, height);
		floorGlow.addColorStop(0, `hsla(${hue},90%,50%,0)`);
		floorGlow.addColorStop(1, `hsla(${hue},90%,50%,.25)`);
		context.fillStyle = floorGlow;
		context.fillRect(0, height * 0.82, width, height * 0.18);
		this.#DrawCrowd(context, beat);
		if (Math.floor(beat) % 16 === 15 && beatPhase < 0.12) {
			context.fillStyle = 'rgba(255,255,255,.14)';
			context.fillRect(0, 0, width, height);
		}
	}


	/** A speaker cabinet with as many cones as fit. */
	#PaintSpeaker(context, x, y, speakerWidth, speakerHeight) {
		context.fillStyle = '#0b0a10';
		context.fillRect(x, y, speakerWidth, speakerHeight);
		context.strokeStyle = 'rgba(255,255,255,.08)';
		context.lineWidth = 1;
		context.strokeRect(x + 0.5, y + 0.5, speakerWidth - 1, speakerHeight - 1);
		const cones = Math.max(1, Math.floor(speakerHeight / (speakerWidth * 0.9)));
		for (let k = 0; k < cones; k++) {
			const centerY = y + speakerWidth * 0.5 + k * speakerWidth * 0.9;
			context.fillStyle = '#16141c';
			context.beginPath();
			context.arc(x + speakerWidth / 2, centerY, speakerWidth * 0.36, 0, FULL_TURN);
			context.fill();
			context.strokeStyle = 'rgba(255,255,255,.1)';
			context.stroke();
			context.fillStyle = '#050408';
			context.beginPath();
			context.arc(x + speakerWidth / 2, centerY, speakerWidth * 0.14, 0, FULL_TURN);
			context.fill();
		}
	}


	/** Four big coloured light pools wandering over the walls, brighter on the beat. */
	#DrawWashLights(context, width, height, time, pulse, floor) {
		for (let k = 0; k < 4; k++) {
			const hue = (time * 30 + k * 90) % 360;
			const x = width * (0.5 + 0.42 * Math.sin(time * 0.23 + k * 1.7));
			const y = floor * (0.45 + 0.3 * Math.sin(time * 0.31 + k));
			const radius = Math.max(width, height) * 0.32;
			const light = context.createRadialGradient(x, y, 0, x, y, radius);
			light.addColorStop(0, `hsla(${hue},100%,55%,${0.1 + 0.08 * pulse})`);
			light.addColorStop(1, `hsla(${hue},100%,55%,0)`);
			context.fillStyle = light;
			context.fillRect(0, 0, width, floor);
		}
	}


	/** Two fans of five laser beams sweeping from the ceiling corners; the colour changes every bar. */
	#DrawLasers(context, width, height, time, pulse, bar) {
		const emitters = [[width * 0.14, height * 0.04], [width * 0.86, height * 0.04]];
		const color = bar % 2 ? '60,255,110' : '255,60,240';
		for (let side = 0; side < 2; side++) {
			for (let k = 0; k < 5; k++) {
				const baseAngle = side ? Math.PI * 0.62 : Math.PI * 0.38;
				const angle = baseAngle + (k - 2) * 0.12 + Math.sin(time * 0.9 + k + side * 2) * 0.45 * (side ? -1 : 1);
				const length = height * 1.6;
				const [startX, startY] = emitters[side];
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
				// A wide faint glow, then the bright core
				context.strokeStyle = `rgba(${color},.08)`;
				context.lineWidth = 8;
				context.stroke();
				context.strokeStyle = `rgba(${color},${0.35 + 0.3 * pulse})`;
				context.lineWidth = 1.4;
				context.stroke();
			}
		}
	}


	/** The mirror ball hanging from the ceiling. */
	#DrawMirrorBall(context, width) {
		const x = width / 2;
		const y = 22;
		context.strokeStyle = 'rgba(200,200,220,.5)';
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x, y - 12);
		context.stroke();
		const shading = context.createRadialGradient(x - 4, y - 4, 1, x, y, 13);
		shading.addColorStop(0, '#fff');
		shading.addColorStop(0.4, '#a9a9bd');
		shading.addColorStop(1, '#3a3a4a');
		context.fillStyle = shading;
		context.beginPath();
		context.arc(x, y, 13, 0, FULL_TURN);
		context.fill();
	}


	/** A flickering neon sign. `color` is "r,g,b". */
	#DrawNeon(context, text, x, y, size, color, time) {
		const flicker = Math.sin(time * 23) > 0.96 ? 0.3 : 1;
		context.font = `700 ${Math.round(size)}px Audiowide,"Chakra Petch",sans-serif`;
		context.textAlign = 'center';
		context.shadowColor = `rgba(${color},1)`;
		context.shadowBlur = 18;
		context.fillStyle = `rgba(${color},${0.85 * flicker})`;
		context.fillText(text, x, y);
		context.shadowBlur = 6;
		context.fillStyle = `rgba(255,255,255,${0.7 * flicker})`;
		context.fillText(text, x, y);
		context.shadowBlur = 0;
	}


	/** The DJ behind the booth, bobbing on the beat, with headphones. */
	#DrawDjBooth(context, width, floor, pulse) {
		const boothWidth = Math.min(180, width * 0.14);
		const boothX = width * 0.82 - boothWidth / 2;
		const boothY = floor - 60;
		const bob = pulse * 4;
		const centerX = boothX + boothWidth / 2;
		context.fillStyle = '#050308';
		context.beginPath();
		context.arc(centerX, boothY - 26 + bob, 13, 0, FULL_TURN);
		context.fill();
		context.fillRect(centerX - 22, boothY - 14 + bob, 44, 30);
		context.strokeStyle = 'rgba(255,255,255,.35)';
		context.lineWidth = 3;
		context.beginPath();
		context.arc(centerX, boothY - 28 + bob, 15, Math.PI * 1.05, Math.PI * 1.95);
		context.stroke();
		context.fillStyle = '#0e0a16';
		context.fillRect(boothX, boothY, boothWidth, 60);
		context.fillStyle = `rgba(255,70,200,${0.5 + 0.4 * pulse})`;
		context.fillRect(boothX, boothY, boothWidth, 3);
		context.font = `700 ${Math.max(9, Math.round(boothWidth * 0.09))}px "Chakra Petch",sans-serif`;
		context.textAlign = 'center';
		context.fillStyle = `rgba(255,160,235,${0.6 + 0.3 * pulse})`;
		context.fillText('DJ DETONATOR', centerX, boothY + 32);
	}


	/** Silhouettes bouncing on the beat; some with their arms up. */
	#DrawCrowd(context, beat) {
		context.fillStyle = '#030106';
		context.strokeStyle = '#030106';
		for (const dancer of this.#crowd) {
			const scale = dancer.scale;
			const bounce = Math.abs(Math.sin((beat + dancer.phase) * Math.PI)) * 6 * scale;
			const x = dancer.x;
			const y = dancer.y - bounce;
			context.beginPath();
			context.ellipse(x, y + 8 * scale, 15 * scale, 12 * scale, 0, Math.PI, 0);
			context.fill();
			context.fillRect(x - 15 * scale, y + 8 * scale, 30 * scale, 44);
			context.beginPath();
			context.arc(x, y - 8 * scale, 8 * scale, 0, FULL_TURN);
			context.fill();
			if (dancer.hasArmsUp) {
				context.lineWidth = 4 * scale;
				context.beginPath();
				context.moveTo(x - 10 * scale, y);
				context.lineTo(x - 14 * scale, y - 24 * scale - bounce);
				context.moveTo(x + 10 * scale, y);
				context.lineTo(x + 14 * scale, y - 24 * scale - bounce);
				context.stroke();
			}
		}
	}
}
