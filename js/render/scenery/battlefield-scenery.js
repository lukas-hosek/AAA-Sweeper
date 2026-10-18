/**
 * battlefield-scenery.js: Sector B-4 (and the title screen): a burning city at dusk, fog, a radio tower, embers.
 */
import {Clamp, FULL_TURN} from '../../core/math.js';
import {random} from '../../core/random.js';
import {Scenery} from './scenery.js';


const HORIZON = 0.64;    // Horizon height as a fraction of the screen


/** Ruins against an orange dusk, a blinking radio tower, rolling fog and embers drifting up. */
export class BattlefieldScenery extends Scenery {
	#towerTop = null;    // Where the tower's warning light blinks: {x, y}


	Build(width, height) {
		const horizon = height * HORIZON;
		this.baked = this.Bake(width, height, context => {
			const sky = context.createLinearGradient(0, 0, 0, horizon);
			sky.addColorStop(0, '#071018');
			sky.addColorStop(0.55, '#192530');
			sky.addColorStop(1, '#5c3b25');
			context.fillStyle = sky;
			context.fillRect(0, 0, width, horizon + 2);

			const sunX = width * 0.84;
			const sunY = horizon - height * 0.04;
			const glow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(width, height) * 0.6);
			glow.addColorStop(0, 'rgba(255,175,95,.55)');
			glow.addColorStop(0.16, 'rgba(225,105,50,.24)');
			glow.addColorStop(1, 'rgba(120,40,20,0)');
			context.fillStyle = glow;
			context.fillRect(0, 0, width, height);

			this.DrawJaggedRidge(context, width, height, horizon - 46, 9, 18, 'rgba(70,56,56,.5)');
			this.DrawJaggedRidge(context, width, height, horizon - 18, 7, 14, 'rgba(38,33,36,.9)');
			this.#PaintRuins(context, width, horizon);
			this.#PaintTower(context, width, height, horizon);
			this.DrawJaggedRidge(context, width, height, horizon + 14, 6, 10, '#0b0b0e');
			const ground = context.createLinearGradient(0, horizon, 0, height);
			ground.addColorStop(0, '#0d0c0f');
			ground.addColorStop(1, '#040405');
			context.fillStyle = ground;
			context.fillRect(0, horizon + 34, width, height);
		});
		const emberCount = Math.round(Clamp(width * height / 12000, 30, 140));
		this.particles = Array.from({length: emberCount}, () => this.#NewEmber(true));
	}


	Draw(context, width, height, time, deltaTime) {
		context.drawImage(this.baked, 0, 0, width, height);
		const horizon = height * HORIZON;
		if (this.#towerTop && Math.sin(time * 3) > 0.2) {
			context.fillStyle = 'rgba(255,40,40,.9)';
			context.beginPath();
			context.arc(this.#towerTop.x, this.#towerTop.y, 2.2, 0, FULL_TURN);
			context.fill();
		}
		this.DrawFog(context, width, time, horizon - height * 0.2, height * 0.4, 1);
		this.DrawSunFlare(context, width, height, width * 0.84, horizon - height * 0.04, 1, true);
		context.globalCompositeOperation = 'lighter';
		for (const ember of this.particles) {
			ember.x += ember.velocityX * deltaTime;
			ember.y += ember.velocityY * deltaTime;
			ember.phase += deltaTime * 6;
			if (ember.y < -10 || ember.x > width + 20) {
				Object.assign(ember, this.#NewEmber(false));
			}
			const alpha = 0.45 + 0.45 * Math.sin(ember.phase);
			context.fillStyle = `hsla(${ember.hue},100%,62%,${alpha})`;
			context.fillRect(ember.x, ember.y, ember.size, ember.size);
		}
		context.globalCompositeOperation = 'source-over';
	}


	/** Eight ruined buildings with a few lit windows. */
	#PaintRuins(context, width, horizon) {
		context.fillStyle = '#17161a';
		for (let k = 0; k < 8; k++) {
			const left = random.Range(0, width);
			const buildingWidth = random.Range(18, 64);
			const buildingHeight = random.Range(18, 90);
			context.beginPath();
			context.moveTo(left, horizon + 8);
			context.lineTo(left, horizon - buildingHeight);
			// A broken roofline
			let x = left;
			while (x < left + buildingWidth) {
				x += random.Range(3, 9);
				context.lineTo(Math.min(x, left + buildingWidth), horizon - buildingHeight + random.Range(-12, 10));
			}
			context.lineTo(left + buildingWidth, horizon + 8);
			context.closePath();
			context.fill();
			context.fillStyle = 'rgba(255,170,90,.18)';
			for (let windowY = horizon - buildingHeight + 14; windowY < horizon; windowY += 10) {
				for (let windowX = left + 4; windowX < left + buildingWidth - 4; windowX += 9) {
					if (random.Next() < 0.12) {
						context.fillRect(windowX, windowY, 3, 4);
					}
				}
			}
			context.fillStyle = '#17161a';
		}
	}


	/** A lattice radio tower on the left. */
	#PaintTower(context, width, height, horizon) {
		const towerX = width * 0.16;
		const towerHeight = height * 0.3;
		context.strokeStyle = '#121114';
		context.lineWidth = 1.3;
		context.beginPath();
		context.moveTo(towerX - 15, horizon);
		context.lineTo(towerX, horizon - towerHeight);
		context.lineTo(towerX + 15, horizon);
		for (let k = 1; k < 10; k++) {
			const y = horizon - towerHeight * k / 10;
			const halfWidth = 15 * (1 - k / 10);
			const nextHalfWidth = 15 * (1 - (k + 1) / 10);
			context.moveTo(towerX - halfWidth, y);
			context.lineTo(towerX + nextHalfWidth, y - towerHeight / 10);
			context.moveTo(towerX + halfWidth, y);
			context.lineTo(towerX - nextHalfWidth, y - towerHeight / 10);
		}
		context.stroke();
		this.#towerTop = {x: towerX, y: horizon - towerHeight};
	}


	/** An ember rising and drifting right; new ones start below the screen, the first batch anywhere on it. */
	#NewEmber(isInitial) {
		return {
			x: random.Range(-60, this.width),
			y: isInitial ? random.Range(0, this.height) : this.height + 10,
			velocityX: random.Range(6, 30),
			velocityY: -random.Range(14, 46),
			size: random.Range(0.6, 2.2),
			phase: random.Range(0, 6.28),
			hue: random.Range(18, 42),
		};
	}
}
