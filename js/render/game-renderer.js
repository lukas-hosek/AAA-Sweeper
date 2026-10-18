/**
 * game-renderer.js: draws one frame of the game screen.
 */
import {FindElement, PREFERS_REDUCED_MOTION} from '../core/dom.js';
import {Clamp} from '../core/math.js';
import {random} from '../core/random.js';
import {settings} from '../core/settings.js';
import {game} from '../game/game.js';
import {blood} from './blood-overlay.js';
import {boardRenderer} from './board-renderer.js';
import {camera} from './camera.js';
import {compass} from './hud/compass.js';
import {minimap} from './hud/minimap.js';
import {radioWaveform} from './hud/radio-waveform.js';
import {layout} from './layout.js';
import {particles} from './particles.js';
import {questMarker} from './quest-marker.js';
import {scenery} from './scenery/scenery-renderer.js';
import {underwater} from './underwater.js';


/**
 * Back to front: scenery, then (offset by the camera) the board, crate, particles and quest marker, then the club
 * light beams, the underwater effects, the HUD canvases, the blood overlay and the damage vignette.
 */
export class GameRenderer {
	canvas = FindElement('#game-canvas');       // The board canvas (input listens on it too)
	context = this.canvas.getContext('2d');


	/** Draws the frame. */
	Draw(time, deltaTime) {
		const field = game.field;
		const context = this.context;
		const viewport = layout.viewport;
		context.setTransform(viewport.pixelRatio, 0, 0, viewport.pixelRatio, 0, 0);
		scenery.Draw(context, viewport.width, viewport.height, time, deltaTime, field.chapter.sceneryClass);
		this.#MoveCamera(time);
		context.save();
		context.translate(camera.x, camera.y);
		boardRenderer.Draw(context, field, time, camera.x, camera.y);
		boardRenderer.DrawSupplyCrate(context, field, time);
		particles.Draw(context, deltaTime);
		questMarker.Draw(context, time);
		questMarker.DrawTrail(context, time);
		context.restore();
		if (field.clubSecondsLeft > 0) {
			this.#DrawClubBeams(context, time);
		}
		if (field.isFlooded) {
			underwater.Draw(context, time);
		}
		compass.Draw(time);
		minimap.Draw(time);
		radioWaveform.Draw();
		blood.Draw(deltaTime);
		const damage = Clamp((1 - field.health / 100) * 1.05 + field.damageFlash * 0.6, 0, 1);
		FindElement('#damage-flash').style.opacity = damage.toFixed(3);
	}


	/** Gentle sway (unless turned off), stronger drifting underwater, and shake after explosions. */
	#MoveCamera(time) {
		const field = game.field;
		let x = 0;
		let y = 0;
		if (settings.cameraSway && !PREFERS_REDUCED_MOTION) {
			x = Math.sin(time * 0.37) * 1.5;
			y = Math.cos(time * 0.29) * 1.1;
		}
		if (field.isFlooded && !PREFERS_REDUCED_MOTION) {
			x += Math.sin(time * 0.55) * 3.5;
			y += Math.cos(time * 0.42) * 2.5;
		}
		if (field.screenShake > 0) {
			x += random.Range(-1, 1) * field.screenShake;
			y += random.Range(-1, 1) * field.screenShake;
		}
		camera.x = x;
		camera.y = y;
	}


	/** Three coloured spotlight beams swinging from the top of the screen while the club is here. */
	#DrawClubBeams(context, time) {
		const viewport = layout.viewport;
		context.save();
		context.globalCompositeOperation = 'lighter';
		for (let k = 0; k < 3; k++) {
			const originX = viewport.width * (0.2 + 0.3 * k);
			const angle = Math.sin(time * 1.3 + k * 2) * 0.5;
			const length = viewport.height * 1.2;
			context.save();
			context.translate(originX, -20);
			context.rotate(angle);
			const hue = (time * 100 + k * 120) % 360;
			const beam = context.createLinearGradient(0, 0, 0, length);
			beam.addColorStop(0, `hsla(${hue},100%,60%,.25)`);
			beam.addColorStop(1, `hsla(${hue},100%,60%,0)`);
			context.fillStyle = beam;
			context.beginPath();
			context.moveTo(-8, 0);
			context.lineTo(8, 0);
			context.lineTo(length * 0.22, length);
			context.lineTo(-length * 0.22, length);
			context.closePath();
			context.fill();
			context.restore();
		}
		context.restore();
	}
}


export const gameRenderer = new GameRenderer();
