/**
 * characters.js: the radio cast, and how a voice line finds its speaker.
 */
import {VOICE_LINES} from './voice-manifest.js';


/**
 * Everyone who talks, keyed by speaker id (the ids also used in tools/tts/lines.py).
 * isRadio: heard through the radio chain and shown in the transmission panel; isPhone: narrower phone band;
 * isEerie: long echo; isPublicAddress: short PA echo; hideSubtitles: never subtitled (the announcer).
 */
export const CHARACTERS = {
	reyes: {name: 'Cmdr. Reyes', tag: 'OVERLORD', channel: 2, color: '#f4b740', isRadio: true},
	kova: {name: 'Dr. Mirela Kova', tag: 'NEUROTECH LABS', channel: 7, color: '#ff6fb1', isRadio: true},
	dez: {name: 'Big Dez', tag: 'DA CLUB', channel: 69, color: '#9bff4a', isRadio: true},
	qm: {name: 'Quartermaster Pryce', tag: 'SUPPLY', channel: 4, color: '#4fd8ff', isRadio: true},
	mom: {name: 'Mom', tag: 'HOME · MOBILE', channel: 1, color: '#ffb48a', isRadio: true, isPhone: true},
	jenkins: {name: 'Pvt. Jenkins', tag: 'SQUAD', channel: 3, color: '#8fb8ff', isRadio: true},
	whisper: {name: '???', tag: 'ENCRYPTED', channel: 0, color: '#c9c9d6', isRadio: true, isEerie: true},
	dj: {
		name: 'DJ Detonator',
		tag: 'PA SYSTEM · DA CLUB',
		channel: 69,
		color: '#ff5cf0',
		isRadio: true,
		isPublicAddress: true,
	},
	prof: {name: 'Prof. Lindqvist', tag: 'STATION NORD-7', channel: 9, color: '#9ff3ff', isRadio: true},
	halcyon: {
		name: 'HALCYON',
		tag: 'PATHOS-4 STATION AI',
		channel: 4,
		color: '#6fe3d6',
		isRadio: true,
		isPublicAddress: true,
	},
	sys: {name: 'SYSTEM', tag: '', color: '#8fd3ff', isRadio: false},
	announcer: {name: '', tag: '', color: '#fff', isRadio: false, hideSubtitles: true},
};


// Voice lines of the first batch carry no speaker in the manifest; the first letter of their id names it
const SPEAKER_BY_ID_PREFIX = {
	r: 'reyes',
	k: 'kova',
	d: 'dez',
	q: 'qm',
	m: 'mom',
	j: 'jenkins',
	w: 'whisper',
	s: 'sys',
	a: 'announcer',
};


/** The speaker id of a voice line. */
export function SpeakerOf(voiceId) {
	const line = VOICE_LINES[voiceId];
	return (line && line.speaker) || SPEAKER_BY_ID_PREFIX[voiceId[0]];
}
