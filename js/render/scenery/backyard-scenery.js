/**
 * backyard-scenery.js: Mom's Backyard: a suburban evening with Mom's house, a picket fence, a garden gnome and fireflies.
 */
import {FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {Scenery} from './scenery.js';


const HORIZON = 0.6;
const FLOWER_COLORS = ['#ff4d6d', '#ffd23f', '#ff8fab', '#ffffff'];


/** A warm sunset over the neighbourhood; the TV flickers, the chimney smokes, fireflies drift, birds fly by. */
export class BackyardScenery extends Scenery {
	#tvWindow = null;    // The window with the flickering TV: {x, y, width, height}


	Build(width, height) {
		const horizon = height * HORIZON;
		this.baked = this.Bake(width, height, context => {
			const sky = context.createLinearGradient(0, 0, 0, horizon);
			sky.addColorStop(0, '#5f7fb5');
			sky.addColorStop(0.6, '#e9a978');
			sky.addColorStop(1, '#ffd08e');
			context.fillStyle = sky;
			context.fillRect(0, 0, width, height);
			const sunX = width * 0.14;
			const sunY = horizon - 24;
			const glow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(width, height) * 0.55);
			glow.addColorStop(0, 'rgba(255,230,170,.8)');
			glow.addColorStop(0.12, 'rgba(255,190,120,.35)');
			glow.addColorStop(1, 'rgba(255,160,90,0)');
			context.fillStyle = glow;
			context.fillRect(0, 0, width, height);
			this.#PaintClouds(context, width, height);
			this.#PaintTreeLine(context, width, horizon);
			for (let k = 0; k < 8; k++) {
				const houseWidth = random.Range(60, 110);
				const x = random.Range(-30, width);
				const houseHeight = random.Range(40, 62);
				this.#PaintHouse(context, x, horizon + 4, houseWidth, houseHeight, '#3c3344', random.Next() < 0.6);
			}
			this.#PaintMomsHouse(context, width, horizon);
			this.#PaintTree(context, width, horizon);
			this.#PaintLawnAndFence(context, width, height, horizon);
			this.#PaintGnome(context, width * 0.3, horizon + 52);
		});
		this.particles = Array.from({length: 60}, () => ({
			x: random.Range(0, width),
			y: random.Range(height * 0.3, height),
			velocityX: random.Range(-8, 8),
			velocityY: random.Range(-6, 6),
			phase: random.Range(0, 6),
		}));
	}


	Draw(context, width, height, time, deltaTime) {
		context.drawImage(this.baked, 0, 0, width, height);
		const horizon = height * HORIZON;
		this.DrawSunFlare(context, width, height, width * 0.14, horizon - 24, 0.8, true);
		const tvWindow = this.#tvWindow;
		if (tvWindow) {
			context.fillStyle = `rgba(120,170,255,${0.35 + 0.3 * Math.abs(Math.sin(time * 7) * Math.sin(time * 2.3))})`;
			context.fillRect(tvWindow.x, tvWindow.y, tvWindow.width, tvWindow.height);
		}
		// Chimney smoke: ten puffs rising and growing
		for (let k = 0; k < 10; k++) {
			const progress = (time * 0.18 + k / 10) % 1;
			const x = width * 0.22 + Math.sin(progress * 6 + k) * 8 * progress + progress * 30;
			const y = horizon + 40 - progress * 160;
			context.fillStyle = `rgba(230,225,220,${0.18 * (1 - progress)})`;
			context.beginPath();
			context.arc(x, y, 6 + progress * 26, 0, FULL_TURN);
			context.fill();
		}
		context.globalCompositeOperation = 'lighter';
		for (const firefly of this.particles) {
			firefly.x += firefly.velocityX * deltaTime + Math.sin(time + firefly.phase) * 0.2;
			firefly.y += firefly.velocityY * deltaTime + Math.cos(time * 0.8 + firefly.phase) * 0.2;
			// They wrap around within the lower part of the screen
			if (firefly.x < 0) {
				firefly.x += width;
			}
			if (firefly.x > width) {
				firefly.x -= width;
			}
			if (firefly.y < height * 0.25) {
				firefly.y = height;
			}
			if (firefly.y > height) {
				firefly.y = height * 0.25;
			}
			context.fillStyle = `rgba(255,235,150,${0.25 + 0.25 * Math.sin(time * 2 + firefly.phase)})`;
			context.beginPath();
			context.arc(firefly.x, firefly.y, 1.6, 0, FULL_TURN);
			context.fill();
		}
		context.globalCompositeOperation = 'source-over';
		// Three birds cross the sky every 23 seconds
		const cycle = (time % 23) / 23;
		if (cycle < 0.35) {
			const progress = cycle / 0.35;
			context.strokeStyle = 'rgba(40,30,40,.7)';
			context.lineWidth = 1.4;
			for (let k = 0; k < 3; k++) {
				const x = width * (-0.05 + 1.1 * progress) - k * 18;
				const y = height * 0.18 + k * 8 + Math.sin(progress * 20 + k) * 3;
				this.DrawBirdV(context, x, y, Math.sin(time * 8 + k) * 3);
			}
		}
	}


	/** Thin pink clouds. */
	#PaintClouds(context, width, height) {
		context.fillStyle = 'rgba(255,220,200,.25)';
		for (let k = 0; k < 6; k++) {
			context.beginPath();
			const x = random.Range(0, width);
			const y = random.Range(height * 0.08, height * 0.35);
			const radiusX = random.Range(60, 160);
			context.ellipse(x, y, radiusX, random.Range(6, 14), 0, 0, FULL_TURN);
			context.fill();
		}
	}


	/** Round tree tops along the horizon. */
	#PaintTreeLine(context, width, horizon) {
		context.fillStyle = 'rgba(84,92,80,.75)';
		for (let x = -20; x < width + 20; x += random.Range(18, 34)) {
			context.beginPath();
			const y = horizon - random.Range(4, 22);
			context.arc(x, y, random.Range(14, 26), 0, FULL_TURN);
			context.fill();
		}
		context.fillRect(0, horizon - 10, width, 14);
	}


	/** A house silhouette with a gabled roof and chimney; `isLit` gives it some lit windows. */
	#PaintHouse(context, x, base, houseWidth, houseHeight, color, isLit) {
		context.fillStyle = color;
		context.fillRect(x, base - houseHeight, houseWidth, houseHeight);
		context.beginPath();
		context.moveTo(x - 6, base - houseHeight);
		context.lineTo(x + houseWidth / 2, base - houseHeight - houseWidth * 0.42);
		context.lineTo(x + houseWidth + 6, base - houseHeight);
		context.closePath();
		context.fill();
		context.fillRect(x + houseWidth * 0.7, base - houseHeight - houseWidth * 0.42, houseWidth * 0.1, houseWidth * 0.3);
		if (isLit) {
			context.fillStyle = '#ffd27a';
			for (let k = 0; k < 3; k++) {
				if (random.Next() < 0.7) {
					context.fillRect(x + houseWidth * (0.15 + k * 0.27), base - houseHeight * 0.7, houseWidth * 0.13, houseHeight * 0.22);
				}
			}
		}
	}


	/** Mom's house in front: a lit window, the door, and the window where the TV is on. */
	#PaintMomsHouse(context, width, horizon) {
		const houseWidth = Math.min(240, width * 0.18);
		const x = width * 0.8 - houseWidth / 2;
		const base = horizon + 30;
		this.#PaintHouse(context, x, base, houseWidth, houseWidth * 0.5, '#4a3a42', false);
		context.fillStyle = '#ffdc8a';
		context.fillRect(x + houseWidth * 0.62, base - houseWidth * 0.36, houseWidth * 0.16, houseWidth * 0.14);
		context.fillStyle = '#2a1f24';
		context.fillRect(x + houseWidth * 0.42, base - houseWidth * 0.3, houseWidth * 0.14, houseWidth * 0.3);
		this.#tvWindow = {x: x + houseWidth * 0.12, y: base - houseWidth * 0.36, width: houseWidth * 0.16, height: houseWidth * 0.14};
	}


	/** A big tree on the left. */
	#PaintTree(context, width, horizon) {
		context.fillStyle = '#2b2422';
		context.fillRect(width * 0.07, horizon - 30, 10, 70);
		context.fillStyle = '#2d4628';
		for (let k = 0; k < 14; k++) {
			context.beginPath();
			const x = width * 0.07 + 5 + random.Range(-46, 46);
			const y = horizon - 60 + random.Range(-40, 26);
			context.arc(x, y, random.Range(18, 32), 0, FULL_TURN);
			context.fill();
		}
	}


	/** The striped lawn, the white picket fence and a row of flowers. */
	#PaintLawnAndFence(context, width, height, horizon) {
		const lawnTop = horizon + 30;
		const lawn = context.createLinearGradient(0, lawnTop, 0, height);
		lawn.addColorStop(0, '#6b9447');
		lawn.addColorStop(1, '#2c4c22');
		context.fillStyle = lawn;
		context.fillRect(0, lawnTop, width, height);
		context.fillStyle = 'rgba(255,255,255,.05)';
		for (let x = 0; x < width; x += 80) {
			context.fillRect(x, lawnTop, 40, height);
		}
		const fenceBase = lawnTop;
		context.fillStyle = '#efe8d8';
		context.fillRect(0, fenceBase - 26, width, 4);
		context.fillRect(0, fenceBase - 12, width, 4);
		for (let x = 4; x < width; x += 16) {
			context.fillStyle = '#efe8d8';
			context.beginPath();
			context.moveTo(x, fenceBase);
			context.lineTo(x, fenceBase - 34);
			context.lineTo(x + 5, fenceBase - 40);
			context.lineTo(x + 10, fenceBase - 34);
			context.lineTo(x + 10, fenceBase);
			context.closePath();
			context.fill();
			context.fillStyle = 'rgba(120,90,70,.25)';
			context.fillRect(x + 7, fenceBase - 34, 3, 34);
		}
		for (let x = 10; x < width; x += random.Range(10, 22)) {
			context.fillStyle = '#2f5a24';
			context.fillRect(x, fenceBase + 4, 1.5, 10);
			context.fillStyle = random.Pick(FLOWER_COLORS);
			context.beginPath();
			context.arc(x + 0.7, fenceBase + 4, 3.2, 0, FULL_TURN);
			context.fill();
		}
	}


	/** A garden gnome with a red hat. */
	#PaintGnome(context, x, y) {
		context.fillStyle = '#d64545';
		context.beginPath();
		context.moveTo(x - 6, y - 10);
		context.lineTo(x, y - 26);
		context.lineTo(x + 6, y - 10);
		context.closePath();
		context.fill();
		context.fillStyle = '#f3d3b5';
		context.fillRect(x - 4, y - 10, 8, 6);
		context.fillStyle = '#fff';
		context.beginPath();
		context.moveTo(x - 5, y - 5);
		context.lineTo(x, y + 4);
		context.lineTo(x + 5, y - 5);
		context.closePath();
		context.fill();
		context.fillStyle = '#3b6fd6';
		context.fillRect(x - 5, y - 1, 10, 10);
	}
}
