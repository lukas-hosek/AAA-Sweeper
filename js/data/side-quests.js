/**
 * side-quests.js: side quests handed out over the radio.
 */
import {profile} from '../core/player-profile.js';


/**
 * Side quests keyed by id. speaker: who hands it out (a CHARACTERS id); bearing and distance: the compass marker;
 * actionLabel: the button in the quest log (TRACK, CALL or OPEN STORE).
 * Objective(field) returns the current objective text; `field` is the field in play, or null.
 */
export const SIDE_QUESTS = {
	kova: {
		name: 'Neural Interface Upgrade',
		giver: 'Dr. Mirela Kova',
		speaker: 'kova',
		description: "Dr. Kova double-crossed you. Now she wants to upgrade the neural interface in your head. She says she's sorry.",
		bearing: 251,
		distance: '3.2 km',
		actionLabel: 'TRACK',
		Objective(field) {
			return 'Visit Dr. Kova’s office · 3.2 km';
		},
	},
	club: {
		name: 'Get Yo Ass In Da Club',
		giver: 'Big Dez',
		speaker: 'dez',
		description: 'Big Dez needs you in the club. Immediately. He has been very clear about this.',
		bearing: 137,
		distance: '2,400 km',
		actionLabel: 'TRACK',
		Objective(field) {
			if (field && field.chapter.isClub) {
				return 'You are in da club';
			}
			return field && field.clubVisited ? 'The club came to you' : 'Get in da club · 2,400 km';
		},
	},
	mom: {
		name: 'Call Your Mother',
		giver: 'Mom',
		speaker: 'mom',
		description: "She's worried. She's always worried. It's been eleven days.",
		bearing: 312,
		distance: 'HOME',
		actionLabel: 'CALL',
		Objective(field) {
			return field && field.chapter.id === 'home' ? 'Visit in person instead' : 'Call Mom back';
		},
	},
	qm: {
		name: 'Premium Flag Collector',
		giver: 'Quartermaster Pryce',
		speaker: 'qm',
		description: 'Own every premium flag skin. For morale.',
		bearing: 40,
		distance: '800 m',
		actionLabel: 'OPEN STORE',
		Objective(field) {
			return `Own premium flags (${profile.CountPremiumSkins()}/3)`;
		},
	},
	whisper: {
		name: 'Whispers in the Field',
		giver: '???',
		speaker: 'whisper',
		description: 'Someone is speaking on an encrypted channel. The signal seems to come from under the tiles.',
		bearing: 0,
		distance: '???',
		actionLabel: 'TRACK',
		Objective(field) {
			return 'Find the source of the voice · ???';
		},
	},
	prof: {
		name: 'Ice Core Samples',
		giver: 'Prof. Lindqvist',
		speaker: 'prof',
		description: 'The professor needs ice core samples. She also needs you to not explode near the ice core samples.',
		bearing: 200,
		distance: '1.1 km',
		actionLabel: 'TRACK',
		Objective(field) {
			return 'Collect ice core samples (0/12) · Not implemented';
		},
	},
	dinner: {
		name: 'Dinner Is Ready',
		giver: 'Mom',
		speaker: 'mom',
		description: 'Mom made your favourite. It will be ready when the lawn is clear.',
		bearing: 15,
		distance: '12 m',
		actionLabel: 'TRACK',
		Objective(field) {
			return field && field.isWon ? 'Go inside' : 'Clear the lawn before dinner gets cold';
		},
	},
	halcyon: {
		name: 'Rate Your Stay',
		giver: 'HALCYON',
		speaker: 'halcyon',
		description: 'The station AI would like you to rate your stay at Pathos-4. Before you drown, ideally.',
		bearing: 270,
		distance: '300 m ↑',
		actionLabel: 'TRACK',
		Objective(field) {
			return 'Leave a 5-star review · Not implemented';
		},
	},
};
