/**
 * chatter-scheduler.js: decides which radio chatter line plays next.
 */
import {random} from '../core/random.js';
import {settings} from '../core/settings.js';
import {SpeakerOf} from '../data/characters.js';
import {CHAPTER_CHATTER, REPEATABLE_LINES, SHARED_CHATTER} from '../data/chatter.js';


const DEFAULT_FAVOURITE_WEIGHT = 2.2;
const WHISPER_WEIGHT = 0.6;              // The encrypted whisperer speaks rarely
const FIRST_CHATTER_TIME = 9;            // Clock time of the first chatter line in a field


// Seconds between chatter lines for each chatter setting: [shortest, longest]
const CHATTER_GAP_SECONDS = {
	off: [1e9, 1e9],
	normal: [11, 19],
	constant: [3.5, 7],
	unbearable: [0.5, 1.6],
};


/**
 * Chatter comes in arcs: each speaker has a little story told over several lines (see data/chatter.js).
 * The opening lines play first; then a weighted pick of speaker, never the same one twice in a row,
 * continues that speaker's arc. When every arc is told, lines shared by all chapters follow, then repeats.
 */
export class ChatterScheduler {
	nextTime = FIRST_CHATTER_TIME;    // Field clock time the next chatter line may start
	queuedLine = null;                // The line that plays next, decoded in advance
	#arcs = {};                       // Speaker id -> line ids of their arc not played yet
	#openingLines = [];               // Lines that play first, in order
	#favouriteSpeakers = [];          // Speakers picked more often in this chapter
	#favouriteWeight = DEFAULT_FAVOURITE_WEIGHT;
	#lastSpeaker = null;              // Not picked twice in a row
	#repeatQueue = [];                // Shuffled repeatable lines being used up
	#sharedLines = null;              // Shuffled shared lines, kept over the chapters of a run; null before the first


	/** Sets up the arcs of a chapter (by its scenery id) and restarts the chatter timing. */
	BeginChapter(scenery) {
		const chapterChatter = CHAPTER_CHATTER[scenery] || CHAPTER_CHATTER.battle;
		const shuffledArcs = chapterChatter.shuffledArcs || [];
		this.#arcs = {};
		for (const speaker in chapterChatter.arcs) {
			const arc = chapterChatter.arcs[speaker];
			// A shuffled arc still opens with its first line, the one that introduces the speaker
			this.#arcs[speaker] = shuffledArcs.includes(speaker) ? [arc[0], ...random.Shuffle(arc.slice(1))] : [...arc];
		}
		this.#favouriteWeight = chapterChatter.favouriteWeight || DEFAULT_FAVOURITE_WEIGHT;
		this.#openingLines = [...chapterChatter.openingLines];
		this.#favouriteSpeakers = chapterChatter.favouriteSpeakers || [];
		this.#lastSpeaker = null;
		this.#repeatQueue = [];
		this.nextTime = FIRST_CHATTER_TIME;
		this.queuedLine = null;
	}


	/** True once the shared lines have been shuffled for a run. */
	get hasSharedLines() {
		return this.#sharedLines !== null;
	}


	/** Shuffles the shared lines for a new run. */
	ShuffleSharedLines() {
		this.#sharedLines = random.Shuffle([...SHARED_CHATTER]);
	}


	/** Adds lines that play before any arc continues (Pathos-4 adds some when the base floods). */
	QueueOpeningLines(voiceIds) {
		this.#openingLines.push(...voiceIds);
	}


	/** Takes the next chatter line id off the arcs. */
	NextLine() {
		if (this.#openingLines.length) {
			const voiceId = this.#openingLines.shift();
			const speaker = SpeakerOf(voiceId);
			// An opening line may be the first line of its speaker's arc: don't play it twice
			const arc = this.#arcs[speaker];
			if (arc && arc[0] === voiceId) {
				arc.shift();
			}
			this.#lastSpeaker = speaker;
			return voiceId;
		}
		let speakers = Object.keys(this.#arcs).filter(speaker => this.#arcs[speaker].length);
		if (speakers.length > 1) {
			speakers = speakers.filter(speaker => speaker !== this.#lastSpeaker);
		}
		if (speakers.length) {
			const speaker = this.#PickWeighted(speakers);
			this.#lastSpeaker = speaker;
			return this.#arcs[speaker].shift();
		}
		if (this.#sharedLines && this.#sharedLines.length) {
			const voiceId = this.#sharedLines.shift();
			this.#lastSpeaker = SpeakerOf(voiceId);
			return voiceId;
		}
		if (!this.#repeatQueue.length) {
			this.#repeatQueue = random.Shuffle([...REPEATABLE_LINES]);
		}
		return this.#repeatQueue.shift();
	}


	/** A random pause before the next chatter line, by the chatter setting. */
	Gap() {
		const [shortest, longest] = CHATTER_GAP_SECONDS[settings.chatter] || CHATTER_GAP_SECONDS.normal;
		return random.Range(shortest, longest);
	}


	/** A speaker picked with the chapter's weights. */
	#PickWeighted(speakers) {
		const weights = speakers.map(speaker => {
			if (this.#favouriteSpeakers.includes(speaker)) {
				return this.#favouriteWeight;
			}
			return speaker === 'whisper' ? WHISPER_WEIGHT : 1;
		});
		let remaining = random.Next() * weights.reduce((sum, weight) => sum + weight, 0);
		let picked = speakers[0];
		for (let i = 0; i < speakers.length; i++) {
			remaining -= weights[i];
			if (remaining <= 0) {
				picked = speakers[i];
				break;
			}
		}
		return picked;
	}
}


export const chatter = new ChatterScheduler();
