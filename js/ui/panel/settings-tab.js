/**
 * settings-tab.js: audio and graphics settings, plus a few locked ones "to preserve the artistic vision".
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {chatter} from '../../audio/chatter-scheduler.js';
import {FindElement} from '../../core/dom.js';
import {settings} from '../../core/settings.js';
import {game} from '../../game/game.js';
import {blood} from '../../render/blood-overlay.js';
import {PanelTab} from './panel-tab.js';


// [settings key, control id, label]
const VOLUME_SLIDERS = [
	['masterVolume', 'master-volume', 'Master volume'],
	['musicVolume', 'music-volume', 'Music'],
	['voiceVolume', 'voice-volume', 'Voices'],
	['effectsVolume', 'effects-volume', 'Sound effects'],
];


// [value, label]
const CHATTER_LEVELS = [
	['off', 'Off (not recommended by our narrative team)'],
	['normal', 'Normal (default)'],
	['constant', 'Constant (they talk over each other)'],
	['unbearable', 'Unbearable'],
];


/**
 * Every control carries data-setting with its settings key and saves as soon as it changes. Sliders are numbers,
 * the chatter level is a string, and the other selects are on/off.
 */
export class SettingsTab extends PanelTab {
	constructor(panel) {
		super(panel, 'settings', 'SETTINGS');
	}


	Markup() {
		const sliders = VOLUME_SLIDERS.map(([key, id, label]) => `<label for="setting-${id}">${label}</label>`
			+ `<input type="range" id="setting-${id}" min="0" max="1" step="0.05" value="${settings[key]}" data-setting="${key}">`).join('');
		const chatterOptions = CHATTER_LEVELS.map(([value, label]) =>
			`<option value="${value}" ${settings.chatter === value ? 'selected' : ''}>${label}</option>`).join('');
		return `<div class="panel-heading">Audio</div>
			<div class="settings-grid">
				${sliders}
				<label for="setting-chatter">Radio chatter</label><select id="setting-chatter" data-setting="chatter">${chatterOptions}</select>
				${this.#OnOffSelect('subtitles', 'subtitles', 'Subtitles', 'On', 'Off')}
			</div>
			<div class="panel-heading" style="margin-top:22px">Graphics</div>
			<div class="settings-grid">
				${this.#OnOffSelect('filmGrain', 'film-grain', 'Film grain', 'Cinematic', 'Off')}
				${this.#OnOffSelect('cameraSway', 'camera-sway', 'Camera sway', 'On', 'Off')}
				${this.#OnOffSelect('blood', 'blood', 'Blood', 'On (cinematic)', 'Off')}
				${this.#LockedSelect('motion-blur', 'Motion blur', 'Cinematic (mandatory)')}
				${this.#LockedSelect('path-tracing', 'Path-traced tiles', 'Ultra')}
				${this.#LockedSelect('upscaling', 'Upscaling', 'Ultra Performance (renders at 9 × 9)')}
				<span class="settings-note">Some options are locked to preserve the artistic vision.</span>
			</div>`;
	}


	/** Saves the changed setting and applies it at once. */
	OnInput(control) {
		const key = control.dataset.setting;
		if (!key) {
			return;
		}
		if (control.type === 'range') {
			settings[key] = Number(control.value);
		} else if (key === 'chatter') {
			settings.chatter = control.value;
		} else {
			settings[key] = control.value === '1';
		}
		settings.Save();
		audioEngine.ApplyVolumes();
		FindElement('#film-grain').classList.toggle('is-off', !settings.filmGrain);
		if (key === 'blood' && !settings.blood) {
			blood.Clear();
			FindElement('#blood-canvas').style.opacity = '0';
		}
		// A new chatter level takes effect from the next line on
		if (key === 'chatter' && game.field) {
			chatter.nextTime = game.field.clock + chatter.Gap();
		}
	}


	/** A select with an on and an off option, for a boolean setting. */
	#OnOffSelect(key, id, label, onLabel, offLabel) {
		const isOn = settings[key];
		return `<label for="setting-${id}">${label}</label><select id="setting-${id}" data-setting="${key}">`
			+ `<option value="1" ${isOn ? 'selected' : ''}>${onLabel}</option>`
			+ `<option value="0" ${isOn ? '' : 'selected'}>${offLabel}</option>`
			+ '</select>';
	}


	/** A select that can't be changed, showing its one option. */
	#LockedSelect(id, label, optionLabel) {
		return `<label for="setting-${id}">${label}</label><select id="setting-${id}" disabled><option>${optionLabel}</option></select>`;
	}
}
