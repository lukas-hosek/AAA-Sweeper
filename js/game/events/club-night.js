/**
 * club-night.js: "Get Yo Ass In Da Club": if you won't come to the club, the club comes to you.
 */
import {music} from '../../audio/music-sequencer.js';
import {FindElement} from '../../core/dom.js';
import {TUNING} from '../../data/tuning.js';
import {achievements} from '../../ui/achievements.js';
import {banners} from '../../ui/banners.js';
import {hud} from '../../ui/hud.js';
import {killFeed} from '../../ui/kill-feed.js';
import {game} from '../game.js';
import {progression} from '../progression.js';


/**
 * Big Dez's side quest ends with the club arriving on the battlefield (his last radio line starts it). For a while the
 * club theme plays and the screen gets club lighting, then the club leaves and the chapter's own music comes back.
 */
export class ClubNight {
	/** The club arrives: club music and lights, a banner and the quest's XP. */
	Start() {
		const field = game.field;
		if (!field || field.isOver) {
			return;
		}
		field.clubSecondsLeft = TUNING.club.duration;
		field.clubVisited = true;
		music.Start('club');
		FindElement('#game').classList.add('is-club-night');
		banners.Show('THE CLUB HAS ARRIVED', 'QUEST COMPLETE', `Get Yo Ass In Da Club · +${TUNING.xp.clubArrival} XP`, '#9bff4a');
		progression.GainXP(TUNING.xp.clubArrival);
		achievements.Unlock('club');
		hud.Refresh();
	}


	/** Counts down while the club is here and sends it off at zero. Called every unpaused frame. */
	Update(field, deltaTime) {
		if (field.clubSecondsLeft > 0) {
			field.clubSecondsLeft -= deltaTime;
			if (field.clubSecondsLeft <= 0) {
				this.#End(field);
			}
		}
	}


	/** The club leaves; the chapter's music returns unless the field is already cleared. */
	#End(field) {
		field.clubSecondsLeft = 0;
		FindElement('#game').classList.remove('is-club-night');
		if (!field.isOver) {
			music.Start(field.chapter.musicTheme);
		}
		killFeed.Add('The club has left. Big Dez thanks you for coming.');
	}
}


export const clubNight = new ClubNight();
