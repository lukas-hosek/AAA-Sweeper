/**
 * radio-waveform.js: the level bars in the radio transmission panel, driven by the voice actually playing.
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {FindElement} from '../../core/dom.js';
import {radioPanel} from '../../ui/radio-panel.js';


const BAR_COUNT = 40;
const SAMPLES_PER_BAR = 6;


/** Forty bars showing the peak level of the voice bus, in the speaker's colour. */
export class RadioWaveform {
	#samples = new Uint8Array(256);    // Analyser time-domain data, 128 = silence


	/** Draws the waveform while the radio panel is shown. */
	Draw() {
		if (FindElement('#radio-panel').hidden || !audioEngine.voiceAnalyser) {
			return;
		}
		const canvas = FindElement('#radio-waveform');
		const context = canvas.getContext('2d');
		const width = canvas.width;
		const height = canvas.height;
		context.clearRect(0, 0, width, height);
		audioEngine.voiceAnalyser.getByteTimeDomainData(this.#samples);
		const barWidth = width / BAR_COUNT;
		context.fillStyle = radioPanel.color;
		for (let k = 0; k < BAR_COUNT; k++) {
			let peak = 0;
			for (let j = 0; j < SAMPLES_PER_BAR; j++) {
				const level = Math.abs(this.#samples[(k * SAMPLES_PER_BAR + j) % 256] - 128);
				if (level > peak) {
					peak = level;
				}
			}
			const barHeight = Math.min(height, Math.max(2, (peak / 128) * height * 1.8));
			context.globalAlpha = 0.85;
			context.fillRect(k * barWidth + 1, (height - barHeight) / 2, barWidth - 2, barHeight);
		}
		context.globalAlpha = 1;
	}
}


export const radioWaveform = new RadioWaveform();
