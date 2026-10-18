/**
 * credits-roll.js: the scrolling list of 1,412 positions, its counter, and the concept art beside it.
 */
import {EscapeHtml, FindElement} from '../../core/dom.js';
import * as creditsText from '../../data/credits-text.js';
import {CHAPTERS} from '../../game/chapters.js';
import {conceptArt} from './concept-art-gallery.js';


const SCROLL_SPEED = 125;                   // Pixels per second
const FAST_SCROLL_SPEED = 1600;             // While fast-forwarding
const ART_SECONDS = 9.5;                    // Each concept art sheet stays this long (5× faster while fast-forwarding)
const MAX_FRAME_SECONDS = 0.1;              // Longer frames (a background tab) don't jump the roll


/**
 * Builds the list once from data/credits-text.js, then scrolls it from below the view to past its end. The counter
 * counts the rows that have passed the middle of the view.
 */
export class CreditsRoll {
	scrollPosition = 0;                     // Pixels scrolled since the start
	rowOffsets = [];                        // offsetTop of every counted row, in order (for the counter)
	listHeight = 0;
	#viewHeight = 0;                        // Height of the visible part of the roll
	#artIndex = 0;                          // Concept art sheet showing
	#artSeconds = 0;                        // How long it has been showing
	#frame = 0;                             // requestAnimationFrame handle
	#lastTimestamp = 0;
	#isFastForward = null;                  // Function telling whether to fast-forward
	#onFinished = null;                     // Resolves Play()'s promise; null once finished or stopped


	/** Builds the list (once: it never changes). */
	Build() {
		const list = FindElement('#credits-list');
		if (list.dataset.built) {
			return;
		}
		let html = '';
		for (const entry of this.#Entries()) {
			if (entry.note) {
				html += `<p class="credits-note">${EscapeHtml(entry.note)}</p>`;
				continue;
			}
			html += `<h3>${EscapeHtml(entry.heading)}</h3>`;
			for (const role of entry.roles) {
				html += `<div class="credits-row is-counted"><span>${EscapeHtml(role)}</span><b>Claude</b></div>`;
			}
		}
		list.innerHTML = html + creditsText.CLOSING_HTML;
		list.dataset.built = '1';
	}


	/** Measures the list and scrolls it to the end. Resolves then; Stop() abandons it without resolving. */
	Play(isFastForward) {
		const list = FindElement('#credits-list');
		this.listHeight = list.offsetHeight;
		this.#viewHeight = FindElement('#credits-roll').clientHeight;
		this.rowOffsets = Array.from(list.querySelectorAll('.is-counted'), row => row.offsetTop);
		this.scrollPosition = 0;
		this.#artIndex = 0;
		this.#artSeconds = 0;
		this.#isFastForward = isFastForward;
		conceptArt.Show(0);
		return new Promise(resolve => {
			this.#onFinished = resolve;
			this.#lastTimestamp = performance.now();
			this.#frame = requestAnimationFrame(timestamp => this.#Tick(timestamp));
		});
	}


	/** Stops scrolling; the promise of Play() never resolves. */
	Stop() {
		cancelAnimationFrame(this.#frame);
		this.#onFinished = null;
	}


	#Tick(timestamp) {
		if (!this.#onFinished) {
			return;
		}
		const deltaTime = Math.min(MAX_FRAME_SECONDS, Math.max(0, (timestamp - this.#lastTimestamp) / 1000));
		this.#lastTimestamp = timestamp;
		const isFast = this.#isFastForward();
		this.scrollPosition += deltaTime * (isFast ? FAST_SCROLL_SPEED : SCROLL_SPEED);
		FindElement('#credits-list').style.transform = `translate3d(0,${Math.round(this.#viewHeight - this.scrollPosition)}px,0)`;
		const passed = this.#CountRowsAbove(this.scrollPosition - this.#viewHeight * 0.5);
		const total = this.rowOffsets.length.toLocaleString('en-US');
		FindElement('#credits-count').textContent = `POSITIONS CREDITED ${String(passed).padStart(4, '0')} / ${total}`;
		this.#artSeconds += deltaTime * (isFast ? 5 : 1);
		if (this.#artSeconds > ART_SECONDS) {
			this.#artSeconds = 0;
			this.#artIndex = (this.#artIndex + 1) % conceptArt.count;
			conceptArt.Show(this.#artIndex);
		}
		if (this.scrollPosition > this.listHeight + this.#viewHeight * 0.6) {
			const onFinished = this.#onFinished;
			this.#onFinished = null;
			onFinished();
			return;
		}
		this.#frame = requestAnimationFrame(nextTimestamp => this.#Tick(nextTimestamp));
	}


	/** Number of counted rows whose top is above `position` (binary search: the offsets are sorted). */
	#CountRowsAbove(position) {
		let low = 0;
		let high = this.rowOffsets.length;
		while (low < high) {
			const middle = (low + high) >> 1;
			if (this.rowOffsets[middle] < position) {
				low = middle + 1;
			} else {
				high = middle;
			}
		}
		return low;
	}


	/** The departments with every placeholder expanded, then the QA studios that fill up the total. */
	#Entries() {
		/** @type {Array<{heading?: string, roles?: string[], note?: string}>} */
		const entries = creditsText.DEPARTMENTS.map(department => department.note
			? department
			: {heading: department.heading, roles: department.roles.flatMap(role => this.#ExpandRole(role))});
		let positions = 0;
		for (const entry of entries) {
			positions += entry.roles ? entry.roles.length : 0;
		}
		positions += creditsText.STUDIOS.length * creditsText.STUDIO_ROLES.length;
		const testers = Math.max(0, creditsText.TOTAL_POSITIONS - positions);
		const testersPerStudio = Math.floor(testers / creditsText.STUDIOS.length);
		const studiosWithAnExtra = testers % creditsText.STUDIOS.length;
		let testerNumber = 0;
		creditsText.STUDIOS.forEach((city, index) => {
			const roles = [...creditsText.STUDIO_ROLES];
			const count = testersPerStudio + (index < studiosWithAnExtra ? 1 : 0);
			for (let k = 0; k < count; k++) {
				roles.push(creditsText.QA_ROLES[testerNumber++ % creditsText.QA_ROLES.length]);
			}
			entries.push({heading: 'MEGALITH ' + city.toUpperCase(), roles});
			if (index === creditsText.STUDIO_NOTE_AFTER) {
				entries.push({note: creditsText.STUDIO_NOTE});
			}
		});
		return entries;
	}


	/** A role, or the roles a placeholder stands for. */
	#ExpandRole(role) {
		switch (role) {
			case '{features}':
				return creditsText.PRODUCED_FEATURES.map(feature => 'Associate Producer, ' + feature);
			case '{chapter levels}':
				return [
					...CHAPTERS.map(chapter => 'Level Designer, ' + chapter.name),
					...CHAPTERS.map(chapter => 'Associate Level Designer, ' + chapter.name),
				];
			case '{numbers}':
				return [1, 2, 3, 4, 5, 6, 7, 8].map(number => 'Number Designer, The Number ' + number);
			case '{characters}':
				return creditsText.WRITTEN_CHARACTERS.map(character => 'Writer, ' + character);
			case '{chapter art}':
				return creditsText.CHAPTER_ART_ROLES.flatMap(artRole => CHAPTERS.flatMap(chapter =>
					['Lead ', 'Senior ', ''].map(seniority => `${seniority}${artRole}, ${chapter.name}`)));
			case '{engineering}':
				return creditsText.ENGINEERING_DISCIPLINES.flatMap(discipline =>
					['Senior ' + discipline + ' Engineer', discipline + ' Engineer']);
			case '{languages}':
				return creditsText.LANGUAGES.flatMap(language =>
					[`Translator (${language})`, `Reviewer (${language})`, `Linguistic QA (${language})`]);
			default:
				return [role];
		}
	}
}
