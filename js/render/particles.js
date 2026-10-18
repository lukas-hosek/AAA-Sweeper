/**
 * particles.js: the particle system: sparks, smoke, dust, glints, flashes, rings, debris, bubbles and confetti.
 */
import {PREFERS_REDUCED_MOTION} from '../core/dom.js';
import {FULL_TURN} from '../core/math.js';
import {random} from '../core/random.js';
import {game} from '../game/game.js';
import {layout} from './layout.js';


const MAX_PARTICLES = 1800;


/** One particle. Launch() sets any field by name; `life` is in seconds and fades the particle out. */
class Particle {
	x = 0;
	y = 0;
	velocityX = 0;        // CSS pixels per second
	velocityY = 0;
	gravity = 0;          // Added to velocityY per second (negative floats up)
	drag = 0;             // Fraction of velocity lost per second
	life = 1;             // Seconds left
	maxLife = 1;          // Seconds it started with
	size = 1;


	/** Sets the particle's fields (after construction, so subclass defaults don't override them). */
	Launch(fields) {
		Object.assign(this, fields);
		this.maxLife = this.life;
		return this;
	}


	/** Moves the particle; returns false once it has expired. */
	Update(deltaTime) {
		this.life -= deltaTime;
		if (this.life <= 0) {
			return false;
		}
		const damping = Math.max(0, 1 - this.drag * deltaTime);
		this.velocityX *= damping;
		this.velocityY = this.velocityY * damping + this.gravity * deltaTime;
		this.x += this.velocityX * deltaTime;
		this.y += this.velocityY * deltaTime;
		return true;
	}


	/** Paints the particle; `alpha` runs from 1 (new) to 0 (expired). */
	Draw(context, alpha, deltaTime) {
	}
}


/** A hot streak along its direction of flight. */
class SparkParticle extends Particle {
	Draw(context, alpha) {
		context.globalCompositeOperation = 'lighter';
		context.strokeStyle = `rgba(255,${170 + (random.Next() * 70 | 0)},80,${alpha})`;
		context.lineWidth = this.size;
		context.beginPath();
		context.moveTo(this.x, this.y);
		context.lineTo(this.x - this.velocityX * 0.035, this.y - this.velocityY * 0.035);
		context.stroke();
	}
}


/** A grey puff that grows as it fades. `color` is its grey level 0..255. */
class SmokeParticle extends Particle {
	color = 60;


	Draw(context, alpha) {
		context.globalCompositeOperation = 'source-over';
		const radius = this.size * (1 + (1 - alpha) * 2.4);
		context.fillStyle = `rgba(${this.color},${this.color},${this.color},${alpha * 0.32})`;
		context.beginPath();
		context.arc(this.x, this.y, radius, 0, FULL_TURN);
		context.fill();
	}
}


/** A glowing square mote. `color` is "r,g,b" (default icy blue). */
class DustParticle extends Particle {
	color = '';


	Draw(context, alpha) {
		context.globalCompositeOperation = 'lighter';
		context.fillStyle = `rgba(${this.color || '150,220,255'},${alpha * 0.7})`;
		context.fillRect(this.x, this.y, this.size, this.size);
	}
}


/** A golden twinkle cross (lore, loot). */
class GlintParticle extends Particle {
	Draw(context, alpha) {
		context.globalCompositeOperation = 'lighter';
		context.strokeStyle = `rgba(255,215,120,${alpha})`;
		context.lineWidth = 1.3;
		const arm = this.size * (0.6 + alpha);
		context.beginPath();
		context.moveTo(this.x - arm, this.y);
		context.lineTo(this.x + arm, this.y);
		context.moveTo(this.x, this.y - arm);
		context.lineTo(this.x, this.y + arm);
		context.stroke();
	}
}


/** The fireball of an explosion. */
class FlashParticle extends Particle {
	Draw(context, alpha) {
		context.globalCompositeOperation = 'lighter';
		const radius = this.size * (1.25 - alpha * 0.25);
		const fireball = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
		fireball.addColorStop(0, `rgba(255,240,200,${alpha})`);
		fireball.addColorStop(0.3, `rgba(255,150,60,${alpha * 0.7})`);
		fireball.addColorStop(1, 'rgba(255,80,20,0)');
		context.fillStyle = fireball;
		context.fillRect(this.x - radius, this.y - radius, 2 * radius, 2 * radius);
	}
}


/** An expanding shock ring; it grows by `growth` pixels over its life. */
class RingParticle extends Particle {
	growth = 0;


	Draw(context, alpha) {
		context.globalCompositeOperation = 'lighter';
		context.strokeStyle = `rgba(255,220,170,${alpha * 0.8})`;
		context.lineWidth = 3 * alpha + 0.5;
		context.beginPath();
		context.arc(this.x, this.y, this.size + (1 - alpha) * this.growth, 0, FULL_TURN);
		context.stroke();
	}
}


/** A tumbling piece of debris. */
class ChunkParticle extends Particle {
	rotation = 0;    // Radians


	Draw(context, alpha, deltaTime) {
		context.globalCompositeOperation = 'source-over';
		context.fillStyle = `rgba(20,16,14,${alpha})`;
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.rotation += deltaTime * 8);
		context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
		context.restore();
	}
}


/** An air bubble wobbling on its way up, with a highlight. */
class BubbleParticle extends Particle {
	phase = 0;    // Offset of the sideways wobble


	Draw(context, alpha) {
		context.globalCompositeOperation = 'source-over';
		this.x += Math.sin(this.life * 3 + this.phase) * 0.4;
		context.strokeStyle = `rgba(200,245,255,${Math.min(1, alpha * 1.4) * 0.55})`;
		context.lineWidth = 1;
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, FULL_TURN);
		context.stroke();
		context.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
		const highlight = Math.max(1, this.size * 0.35);
		context.fillRect(this.x - this.size * 0.4, this.y - this.size * 0.45, highlight, highlight);
	}
}


/** A spinning confetti strip in a hue. */
class ConfettiParticle extends Particle {
	hue = 0;
	rotation = 0;


	Draw(context, alpha, deltaTime) {
		context.globalCompositeOperation = 'source-over';
		context.fillStyle = `hsla(${this.hue},95%,62%,${Math.min(1, alpha * 1.5)})`;
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.rotation += deltaTime * 7);
		context.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
		context.restore();
	}
}


// Particle class by the `type` given to Emit()
const PARTICLE_TYPES = {
	spark: SparkParticle,
	smoke: SmokeParticle,
	dust: DustParticle,
	glint: GlintParticle,
	flash: FlashParticle,
	ring: RingParticle,
	chunk: ChunkParticle,
	bubble: BubbleParticle,
	confetti: ConfettiParticle,
};


/** All live particles. They live in board space (the camera offset is applied when drawing). */
export class ParticleSystem {
	#particles = [];


	/** Removes every particle (a new field). */
	Clear() {
		this.#particles.length = 0;
	}


	/** Adds a particle. options.type picks the kind (spark, smoke, dust, glint, flash, ring, chunk, bubble, confetti). */
	Emit(options) {
		if (this.#particles.length < MAX_PARTICLES) {
			const {type, ...fields} = options;
			this.#particles.push(new PARTICLE_TYPES[type]().Launch(fields));
		}
	}


	/** A mine going off at (x, y): fireball, shock ring, sparks, smoke and debris; plus bubbles underwater. */
	Explode(x, y) {
		const tileSize = layout.board.tileSize;
		this.Emit({type: 'flash', x, y, life: 0.32, size: tileSize * 4.5});
		this.Emit({type: 'ring', x, y, life: 0.55, size: tileSize * 0.3, growth: tileSize * 4.5});
		for (let k = 0; k < 80; k++) {
			const angle = random.Range(0, FULL_TURN);
			const speed = random.Range(140, 640);
			this.Emit({
				type: 'spark', x, y, velocityX: Math.cos(angle) * speed, velocityY: Math.sin(angle) * speed - 120, gravity: 520, drag: 1.4,
				life: random.Range(0.3, 1), size: random.Range(1, 2.6),
			});
		}
		for (let k = 0; k < 24; k++) {
			const angle = random.Range(0, FULL_TURN);
			const speed = random.Range(10, 90);
			this.Emit({
				type: 'smoke',
				x: x + random.Range(-tileSize * 0.3, tileSize * 0.3),
				y: y + random.Range(-tileSize * 0.3, tileSize * 0.3),
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed - random.Range(20, 60),
				gravity: -22,
				drag: 1.1,
				life: random.Range(1.3, 2.8),
				size: random.Range(tileSize * 0.3, tileSize * 0.7),
				color: random.Range(35, 85) | 0,
			});
		}
		for (let k = 0; k < 14; k++) {
			const angle = random.Range(-Math.PI, 0);
			const speed = random.Range(120, 380);
			this.Emit({
				type: 'chunk', x, y, velocityX: Math.cos(angle) * speed, velocityY: Math.sin(angle) * speed, gravity: 900, drag: 0.6,
				life: random.Range(0.6, 1.2), size: random.Range(2, 4), rotation: random.Range(0, 6),
			});
		}
		game.field.screenShake = PREFERS_REDUCED_MOTION ? 3 : 17;
		if (game.field.isFlooded) {
			for (let k = 0; k < 40; k++) {
				const bubbleX = x + random.Range(-tileSize, tileSize);
				const bubbleY = y + random.Range(-tileSize, tileSize);
				this.EmitBubble(bubbleX, bubbleY, random.Range(2, 6));
			}
		}
	}


	/** A rising air bubble at (x, y); `size` 0 picks a random size. */
	EmitBubble(x, y, size) {
		const velocityX = random.Range(-10, 10);
		const velocityY = -random.Range(40, 120);
		const life = random.Range(2, 5);
		this.Emit({
			type: 'bubble', x, y, velocityX, velocityY, gravity: -20, drag: 0.4, life,
			size: size || random.Range(1.5, 5), phase: random.Range(0, 6),
		});
	}


	/** Moves and paints every particle, newest first, and drops the expired ones. */
	Draw(context, deltaTime) {
		const particles = this.#particles;
		for (let k = particles.length - 1; k >= 0; k--) {
			const particle = particles[k];
			if (!particle.Update(deltaTime)) {
				particles.splice(k, 1);
				continue;
			}
			particle.Draw(context, particle.life / particle.maxLife, deltaTime);
		}
		context.globalCompositeOperation = 'source-over';
	}
}


export const particles = new ParticleSystem();
