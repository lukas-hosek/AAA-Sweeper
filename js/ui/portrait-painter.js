/**
 * portrait-painter.js: the procedurally drawn character portraits of the radio panel (and the credits).
 */
import {FindElement} from '../core/dom.js';
import {FULL_TURN} from '../core/math.js';
import {CHARACTERS} from '../data/characters.js';


const PORTRAIT_SIZE = 84;               // Portraits are drawn in an 84 × 84 space, scaled to the canvas
const SILHOUETTE_COLOR = '#0a0e12';     // Head and shoulders
const GEAR_COLOR = '#141a20';           // Helmets and hats


/**
 * Every portrait is a dark silhouette against a gradient in the speaker's colour, rim-lit in that colour, with a
 * few features that identify the character (a helmet, glasses, a cap, a hood, headphones...). HALCYON, the base's
 * computer, is a glowing eye instead.
 */
export class PortraitPainter {
	/** Paints a speaker's portrait (a CHARACTERS id) into `canvas`, by default the radio panel's. */
	Paint(speakerId, canvas = FindElement('#portrait-canvas')) {
		const context = canvas.getContext('2d');
		const scale = canvas.width / PORTRAIT_SIZE;
		const color = CHARACTERS[speakerId].color;
		context.setTransform(scale, 0, 0, scale, 0, 0);
		const background = context.createLinearGradient(0, 0, 0, PORTRAIT_SIZE);
		background.addColorStop(0, this.#Darken(color, 0.42));
		background.addColorStop(1, '#04070a');
		context.fillStyle = background;
		context.fillRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
		if (speakerId === 'halcyon') {
			this.#PaintHalcyon(context, color);
			return;
		}
		// Shoulders and neck
		context.fillStyle = SILHOUETTE_COLOR;
		context.beginPath();
		context.ellipse(42, 96, 36, 30, 0, 0, Math.PI * 2);
		context.fill();
		context.fillRect(35, 52, 14, 16);
		this.#PaintBehindHead(context, speakerId);
		// Head, rim-lit on the right
		context.fillStyle = SILHOUETTE_COLOR;
		context.beginPath();
		context.ellipse(42, 40, 15, 18, 0, 0, Math.PI * 2);
		context.fill();
		context.strokeStyle = color;
		context.globalAlpha = 0.85;
		context.lineWidth = 1.4;
		context.beginPath();
		context.ellipse(42, 40, 15, 18, 0, -1.2, 1.1);
		context.stroke();
		context.globalAlpha = 1;
		context.fillStyle = GEAR_COLOR;
		context.strokeStyle = color;
		this.#PaintFeatures(context, speakerId, color);
	}


	/** Hair that falls behind the head: Dr. Kova's long hair, Mom's curls. */
	#PaintBehindHead(context, speakerId) {
		if (speakerId === 'kova') {
			context.fillStyle = '#120d16';
			context.beginPath();
			context.moveTo(24, 40);
			context.quadraticCurveTo(22, 14, 42, 16);
			context.quadraticCurveTo(62, 14, 60, 40);
			context.lineTo(62, 70);
			context.lineTo(22, 70);
			context.closePath();
			context.fill();
		} else if (speakerId === 'mom') {
			context.fillStyle = '#24180f';
			for (let i = 0; i < 9; i++) {
				const angle = Math.PI * (1.05 + i * 0.11);
				context.beginPath();
				context.arc(42 + Math.cos(angle) * 16, 38 + Math.sin(angle) * 18, 7, 0, Math.PI * 2);
				context.fill();
			}
		}
	}


	/** What identifies each character, drawn over the head. Expects the gear colour as fill, theirs as stroke. */
	#PaintFeatures(context, speakerId, color) {
		switch (speakerId) {
			case 'reyes':
				this.#PaintHelmet(context);
				this.#PaintHeadsetMicrophone(context, color);
				break;
			case 'jenkins':
				this.#PaintHelmet(context);
				this.#PaintJenkinsGoggles(context, color);
				break;
			case 'kova':
				this.#PaintKovaGlasses(context);
				break;
			case 'dez':
				this.#PaintDez(context);
				break;
			case 'qm':
				this.#PaintQuartermaster(context, color);
				break;
			case 'mom':
				// Earrings
				context.fillStyle = color;
				context.beginPath();
				context.arc(27, 46, 2, 0, Math.PI * 2);
				context.arc(57, 46, 2, 0, Math.PI * 2);
				context.fill();
				break;
			case 'whisper':
				this.#PaintWhisper(context, color);
				break;
			case 'dj':
				this.#PaintHeadphones(context, color);
				break;
			case 'prof':
				this.#PaintProfessor(context, color);
				break;
		}
	}


	/** The soldiers' helmet. */
	#PaintHelmet(context) {
		context.beginPath();
		context.arc(42, 36, 19, Math.PI, 0);
		context.lineTo(62, 40);
		context.lineTo(22, 40);
		context.closePath();
		context.fill();
		context.globalAlpha = 0.6;
		context.stroke();
		context.globalAlpha = 1;
	}


	/** Cmdr. Reyes: a headset microphone. */
	#PaintHeadsetMicrophone(context, color) {
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(26, 44);
		context.quadraticCurveTo(28, 58, 40, 56);
		context.stroke();
		context.fillStyle = color;
		context.fillRect(39, 54, 4, 3);
	}


	/** Pvt. Jenkins: goggles on the helmet and a big smile. */
	#PaintJenkinsGoggles(context, color) {
		context.fillStyle = '#1d252c';
		context.beginPath();
		context.arc(35, 28, 5, 0, Math.PI * 2);
		context.arc(49, 28, 5, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = color;
		context.globalAlpha = 0.7;
		context.fillRect(33, 26, 2, 2);
		context.fillRect(47, 26, 2, 2);
		context.globalAlpha = 1;
		context.strokeStyle = '#e8eef2';
		context.lineWidth = 1.5;
		context.beginPath();
		context.arc(42, 46, 6, 0.2, Math.PI - 0.2);
		context.stroke();
	}


	/** Dr. Kova: rectangular glasses that catch the light. */
	#PaintKovaGlasses(context) {
		context.lineWidth = 1.6;
		context.strokeRect(32, 37, 8, 5);
		context.strokeRect(44, 37, 8, 5);
		context.beginPath();
		context.moveTo(40, 39);
		context.lineTo(44, 39);
		context.stroke();
		context.fillStyle = '#fff';
		context.fillRect(34, 38, 2, 1);
		context.fillRect(46, 38, 2, 1);
	}


	/** Big Dez: a cap with a long brim and a gold chain with a pendant. */
	#PaintDez(context) {
		context.beginPath();
		context.arc(42, 32, 16, Math.PI, 0);
		context.lineTo(66, 32);
		context.lineTo(66, 35);
		context.lineTo(26, 35);
		context.closePath();
		context.fill();
		context.globalAlpha = 0.7;
		context.stroke();
		context.globalAlpha = 1;
		context.strokeStyle = '#ffd34d';
		context.lineWidth = 2.4;
		context.beginPath();
		context.arc(42, 58, 12, 0.25, Math.PI - 0.25);
		context.stroke();
		context.fillStyle = '#ffd34d';
		context.fillRect(40, 68, 5, 5);
	}


	/** Quartermaster Pryce: a peaked cap and a moustache. */
	#PaintQuartermaster(context, color) {
		context.beginPath();
		context.ellipse(42, 26, 24, 4, 0, 0, Math.PI * 2);
		context.fill();
		context.beginPath();
		context.ellipse(42, 20, 13, 10, 0, Math.PI, 0);
		context.fill();
		context.fillRect(29, 20, 26, 6);
		context.globalAlpha = 0.6;
		context.stroke();
		context.globalAlpha = 1;
		context.fillStyle = color;
		context.globalAlpha = 0.8;
		context.beginPath();
		context.moveTo(32, 48);
		context.quadraticCurveTo(42, 42, 52, 48);
		context.quadraticCurveTo(42, 46, 32, 48);
		context.fill();
		context.globalAlpha = 1;
	}


	/** The encrypted voice ("???"): a hood with nothing in it but two glowing eyes. */
	#PaintWhisper(context, color) {
		context.fillStyle = '#07090c';
		context.beginPath();
		context.moveTo(42, 10);
		context.quadraticCurveTo(66, 22, 62, 62);
		context.lineTo(22, 62);
		context.quadraticCurveTo(18, 22, 42, 10);
		context.fill();
		context.fillStyle = '#000';
		context.beginPath();
		context.ellipse(42, 42, 11, 14, 0, 0, Math.PI * 2);
		context.fill();
		context.shadowColor = color;
		context.shadowBlur = 8;
		context.fillStyle = '#e9e9ff';
		context.fillRect(36, 40, 4, 2);
		context.fillRect(45, 40, 4, 2);
		context.shadowBlur = 0;
	}


	/** DJ Detonator: headphones. */
	#PaintHeadphones(context, color) {
		context.strokeStyle = color;
		context.lineWidth = 3;
		context.beginPath();
		context.arc(42, 38, 18, Math.PI * 1.08, Math.PI * 1.92);
		context.stroke();
		context.fillStyle = color;
		context.fillRect(22, 36, 6, 12);
		context.fillRect(56, 36, 6, 12);
	}


	/** Prof. Lindqvist: a beanie with a pompom, and round glasses. */
	#PaintProfessor(context, color) {
		context.fillStyle = '#1c2a33';
		context.beginPath();
		context.arc(42, 32, 16, Math.PI, 0);
		context.fill();
		context.fillRect(26, 28, 32, 6);
		context.fillStyle = color;
		context.beginPath();
		context.arc(42, 14, 3.5, 0, FULL_TURN);
		context.fill();
		context.strokeStyle = color;
		context.lineWidth = 1.4;
		context.beginPath();
		context.arc(36, 41, 4, 0, FULL_TURN);
		context.moveTo(52, 41);
		context.arc(48, 41, 4, 0, FULL_TURN);
		context.stroke();
	}


	/** HALCYON, the base's computer: concentric rings around a glowing eye. */
	#PaintHalcyon(context, color) {
		context.strokeStyle = color;
		context.lineWidth = 2;
		for (let k = 0; k < 3; k++) {
			context.globalAlpha = 0.9 - k * 0.25;
			context.beginPath();
			context.arc(42, 42, 12 + k * 9, 0, FULL_TURN);
			context.stroke();
		}
		context.globalAlpha = 1;
		context.fillStyle = color;
		context.shadowColor = color;
		context.shadowBlur = 14;
		context.beginPath();
		context.arc(42, 42, 7, 0, FULL_TURN);
		context.fill();
		context.shadowBlur = 0;
		context.fillStyle = '#fff';
		context.beginPath();
		context.arc(39, 39, 2, 0, FULL_TURN);
		context.fill();
	}


	/** A '#rrggbb' colour scaled towards black by `factor`, as an rgb() string. */
	#Darken(hexColor, factor) {
		const value = parseInt(hexColor.slice(1), 16);
		const r = (value >> 16) & 255;
		const g = (value >> 8) & 255;
		const b = value & 255;
		return `rgb(${r * factor | 0},${g * factor | 0},${b * factor | 0})`;
	}
}


export const portraitPainter = new PortraitPainter();
