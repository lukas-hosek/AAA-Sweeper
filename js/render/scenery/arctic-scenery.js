/**
 * arctic-scenery.js: Station Nord-7: a polar night with aurora, stars, mountains, the research station and snow.
 */
import {Clamp, FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {Scenery} from './scenery.js';


const HORIZON = 0.62;


/** Aurora curtains sway over a starry sky; a radio mast blinks, a meteor streaks past, snow falls. */
export class ArcticScenery extends Scenery {
	#mastTop = null;        // The mast's warning light: {x, y}
	#auroraStrip = null;    // A 4 px wide vertical gradient, stretched into aurora columns


	Build(width, height) {
		const horizon = height * HORIZON;
		this.baked = this.Bake(width, height, context => {
			const sky = context.createLinearGradient(0, 0, 0, horizon);
			sky.addColorStop(0, '#01040b');
			sky.addColorStop(0.55, '#071a2e');
			sky.addColorStop(1, '#173a55');
			context.fillStyle = sky;
			context.fillRect(0, 0, width, height);
			for (let k = 0; k < Math.round(width * height / 2600); k++) {
				context.fillStyle = `rgba(255,255,255,${random.Range(0.15, 0.8)})`;
				const starSize = random.Next() < 0.08 ? 1.6 : 1;
				const x = random.Range(0, width);
				context.fillRect(x, random.Range(0, horizon * 0.95), starSize, starSize);
			}
			this.#PaintMountains(context, width, height, horizon - 40, 16, 22, '#1c3246', 'rgba(220,236,248,.45)');
			this.#PaintMountains(context, width, height, horizon - 8, 10, 16, '#2a465e', 'rgba(230,242,252,.55)');
			const ice = context.createLinearGradient(0, horizon, 0, height);
			ice.addColorStop(0, '#a9c7dc');
			ice.addColorStop(1, '#56778f');
			context.fillStyle = ice;
			context.fillRect(0, horizon + 10, width, height);
			this.#PaintIceCracks(context, width, height, horizon);
			this.#PaintStation(context, width, horizon);
		});
		this.#auroraStrip = this.#PaintAuroraStrip();
		const flakeCount = Math.round(Clamp(width * height / 8000, 50, 220));
		this.particles = Array.from({length: flakeCount}, () => ({
			x: random.Range(0, width),
			y: random.Range(0, height),
			velocityY: random.Range(18, 55),
			size: random.Range(1, 2.6),
			phase: random.Range(0, 6),
		}));
	}


	Draw(context, width, height, time, deltaTime) {
		context.drawImage(this.baked, 0, 0, width, height);
		const horizon = height * HORIZON;
		context.globalCompositeOperation = 'lighter';
		this.#DrawAurora(context, width, height, time);
		context.globalAlpha = 1;
		if (this.#mastTop && Math.sin(time * 2.5) > 0.3) {
			context.fillStyle = 'rgba(255,50,50,.9)';
			context.beginPath();
			context.arc(this.#mastTop.x, this.#mastTop.y, 2, 0, FULL_TURN);
			context.fill();
		}
		this.#DrawMeteor(context, width, height, time);
		context.globalCompositeOperation = 'source-over';
		const mist = context.createLinearGradient(0, horizon - 60, 0, horizon + 80);
		mist.addColorStop(0, 'rgba(200,225,245,0)');
		mist.addColorStop(0.5, 'rgba(200,225,245,.16)');
		mist.addColorStop(1, 'rgba(200,225,245,0)');
		context.fillStyle = mist;
		context.fillRect(0, horizon - 60, width, 140);
		context.fillStyle = '#fff';
		for (const flake of this.particles) {
			flake.y += flake.velocityY * deltaTime;
			flake.x += Math.sin(time + flake.phase) * 0.4;
			if (flake.y > height + 4) {
				flake.y = -4;
				flake.x = random.Range(0, width);
			}
			context.globalAlpha = 0.45 + 0.4 * Math.abs(Math.sin(flake.phase));
			context.fillRect(flake.x, flake.y, flake.size, flake.size);
		}
		context.globalAlpha = 1;
	}


	/** A mountain range with a snow line along its ridge. */
	#PaintMountains(context, width, height, base, amplitude, step, color, snowColor) {
		const ridge = [];
		let y = base;
		for (let x = 0; x <= width + step; x += step) {
			y = Clamp(y + random.Range(-amplitude, amplitude), base - amplitude * 4, base + amplitude);
			ridge.push([x, y]);
		}
		context.fillStyle = color;
		context.beginPath();
		context.moveTo(0, height);
		for (const [x, ridgeY] of ridge) {
			context.lineTo(x, ridgeY);
		}
		context.lineTo(width, height);
		context.closePath();
		context.fill();
		context.strokeStyle = snowColor;
		context.lineWidth = 2.2;
		context.beginPath();
		ridge.forEach(([x, ridgeY], i) => {
			if (i) {
				context.lineTo(x, ridgeY);
			} else {
				context.moveTo(x, ridgeY);
			}
		});
		context.stroke();
	}


	/** Faint cracks across the sea ice. */
	#PaintIceCracks(context, width, height, horizon) {
		context.strokeStyle = 'rgba(255,255,255,.18)';
		context.lineWidth = 1;
		for (let k = 0; k < 26; k++) {
			let x = random.Range(0, width);
			let y = random.Range(horizon + 20, height);
			context.beginPath();
			context.moveTo(x, y);
			for (let j = 0; j < 4; j++) {
				x += random.Range(-40, 40);
				y += random.Range(-6, 10);
				context.lineTo(x, y);
			}
			context.stroke();
		}
	}


	/** The research station: a dome, two lit huts on stilts and a radio mast. */
	#PaintStation(context, width, horizon) {
		const domeX = width * 0.84;
		const base = horizon + 16;
		context.fillStyle = '#c6d3dc';
		context.beginPath();
		context.arc(domeX, base, 34, Math.PI, 0);
		context.fill();
		context.fillStyle = 'rgba(0,0,0,.18)';
		context.beginPath();
		context.moveTo(domeX, base);
		context.arc(domeX, base, 34, Math.PI * 1.5, 0);
		context.closePath();
		context.fill();
		context.fillStyle = '#8fa3b1';
		context.fillRect(domeX + 40, base - 26, 70, 22);
		context.fillRect(domeX - 110, base - 22, 64, 18);
		context.fillStyle = '#3b4a55';
		for (const stiltX of [domeX + 44, domeX + 104, domeX - 106, domeX - 52]) {
			context.fillRect(stiltX, base - 4, 3, 8);
		}
		context.fillStyle = '#ffd27a';
		for (let k = 0; k < 5; k++) {
			context.fillRect(domeX + 46 + k * 12, base - 20, 6, 5);
		}
		for (let k = 0; k < 4; k++) {
			context.fillRect(domeX - 104 + k * 14, base - 17, 6, 5);
		}
		context.strokeStyle = '#5d6f7c';
		context.lineWidth = 1.5;
		context.beginPath();
		context.moveTo(domeX + 75, base - 26);
		context.lineTo(domeX + 75, base - 120);
		context.stroke();
		for (let k = 1; k < 6; k++) {
			context.beginPath();
			context.moveTo(domeX + 69, base - 26 - k * 17);
			context.lineTo(domeX + 81, base - 26 - k * 17);
			context.stroke();
		}
		this.#mastTop = {x: domeX + 75, y: base - 120};
	}


	/** The colour ramp of one aurora column: green at the bottom, through teal, to violet at the top. */
	#PaintAuroraStrip() {
		const strip = document.createElement('canvas');
		strip.width = 4;
		strip.height = 256;
		const context = strip.getContext('2d');
		const ramp = context.createLinearGradient(0, 256, 0, 0);
		ramp.addColorStop(0, 'rgba(90,255,170,0)');
		ramp.addColorStop(0.12, 'rgba(90,255,170,.9)');
		ramp.addColorStop(0.45, 'rgba(60,220,200,.45)');
		ramp.addColorStop(0.8, 'rgba(150,90,255,.25)');
		ramp.addColorStop(1, 'rgba(150,90,255,0)');
		context.fillStyle = ramp;
		context.fillRect(0, 0, 4, 256);
		return strip;
	}


	/** Three curtains of aurora columns, waving and changing length. */
	#DrawAurora(context, width, height, time) {
		for (let curtain = 0; curtain < 3; curtain++) {
			const base = height * (0.2 + curtain * 0.06);
			const phase = curtain * 2.1;
			for (let x = 0; x < width; x += 5) {
				const bottom = base + Math.sin(x * 0.004 + time * 0.15 + phase) * 40 + Math.sin(x * 0.011 - time * 0.3 + phase) * 14;
				const length = 90 + 60 * Math.sin(x * 0.007 + time * 0.4 + phase);
				context.globalAlpha = Clamp(0.16 + 0.12 * Math.sin(x * 0.02 + time * 0.8 + phase), 0, 1) * (curtain === 1 ? 0.8 : 1);
				context.drawImage(this.#auroraStrip, x, bottom - length, 6, length + 10);
			}
		}
	}


	/** A meteor crossing the sky for one second out of every 17. */
	#DrawMeteor(context, width, height, time) {
		const cycle = (time % 17) / 17;
		if (cycle >= 0.06) {
			return;
		}
		const progress = cycle / 0.06;
		const x = width * (0.1 + 0.5 * progress);
		const y = height * (0.08 + 0.12 * progress);
		const tail = context.createLinearGradient(x, y, x - 60, y - 18);
		tail.addColorStop(0, 'rgba(255,255,255,.9)');
		tail.addColorStop(1, 'rgba(255,255,255,0)');
		context.strokeStyle = tail;
		context.lineWidth = 1.5;
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x - 60, y - 18);
		context.stroke();
	}
}
