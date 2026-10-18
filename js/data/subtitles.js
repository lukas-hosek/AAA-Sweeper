/**
 * subtitles.js: subtitle text of every voice line.
 */
import {VOICE_LINES} from './voice-manifest.js';


// Subtitles of the first voice batch. Later batches carry their subtitle in the generated manifest.
const BATCH_ONE_SUBTITLES = {
	r_start: 'Sweeper, this is Overlord. The field is hot. Follow the marker, and nobody else has to die.',
	r_copy: 'Sweeper, do you copy? Click the glowing tile. The one with the big arrow over it.',
	r_intel: "Intel says this field is full of mines. That's why they call it a minefield.",
	r_hit1: "Sweeper's hit! Get to cover and let your health regenerate!",
	r_hit2: 'Take cover! Just stand still for a bit. Your body can heal from anything.',
	r_hit3: 'Was that a mine? Sweeper, the marker was literally right next to it.',
	r_area: 'Good effect on target! Area cleared!',
	r_idle: "Sweeper, why have you stopped? The marker is right there. It's glowing.",
	r_flag: 'Mine marked. Good eye, Sweeper.',
	r_win: "Field is clear! Outstanding work, Sweeper. Now get back to base. We've got another field. And forty more after that.",
	r_dead: "Sweeper's down! Sweeper's down! Somebody reload the checkpoint!",
	r_push: "Keep pushing, Sweeper! Those tiles won't reveal themselves!",
	r_half: "You're halfway there, Sweeper. I've seen men give up at halfway. Don't be those men.",
	k_1: "Hey! I'm sorry for double-crossing you. When you have time, come by my office and I'll upgrade that minesweeping neural interface for you.",
	k_2: "Sweeper, it's Mirela. I know you're still mad. The upgrade offer stands. No strings attached. Mostly.",
	k_3: 'Okay, full disclosure. The neural interface upgrade has a small subscription fee. 9.99 a month.',
	k_4: 'I may have also planted some of these mines. In my defense, it was a very confusing week.',
	k_5: 'The upgrade is ready. It shows you which tiles are safe. Oh. You already have that. Never mind.',
	k_dead: "Don't worry, Sweeper. I can rebuild you. Better. Faster. With a monthly subscription.",
	d_1: 'Yoo, Sweeper, where you been? Get yo ass in da club immediately!',
	d_2: "Sweeper! The club is open, the DJ is waiting, and you're out there clicking squares? Come on, man!",
	d_3: "Bro. I put you on the guest list three times. Three times! The bouncer thinks you're a myth.",
	d_4: "Okay. I'm not mad. I'm just saying. The club is very sad without you.",
	d_5: "That's it. If you won't come to the club, the club is coming to you! Drop it!",
	d_win: "Yo, you done? You done? Club. Now. I'm sending a car.",
	q_1: 'Sweeper, Quartermaster here. New flag skins have just arrived. Gold, chrome, and one that plays a little tune.',
	q_2: 'A reminder that your premium battle pass expires in four hours. No pressure. Some pressure.',
	q_3: "Those mines won't flag themselves. Unless you buy the auto-flag bundle. 12.99.",
	q_4: "Limited time offer, Sweeper. Buy one flag, get one flag. That's two flags.",
	m_1: "Hi sweetie, it's Mom. I don't really understand your job, but please don't step on anything.",
	m_2: "Your cousin's wedding is on Saturday, and you still haven't answered the invitation. Also, are you eating?",
	m_3: 'Your father wants to know if minesweeping comes with a pension plan.',
	m_4: 'I saw on the news there was an explosion. Was that you? Call me back.',
	j_1: "Whoa, nice click, Sweeper! I couldn't have clicked that better myself!",
	j_2: "I've marked the safe tile on your HUD. And on your compass. And on the minimap. And in the sky.",
	j_3: "I'll hold this position! ...I'm just gonna stand here, actually. Holding.",
	j_lore: "Ooh, a collectible! That's one of four hundred!",
	j_low: "Sweeper, you're bleeding pixels! Stay away from the mines!",
	j_4: "Follow me, Sweeper! Actually, you follow the marker. I'll follow you.",
	w_1: 'The mines were here before us, Sweeper. They will be here after.',
	w_2: 'Every number tells a story. Most of those stories are about mines.',
	w_3: "You think you're clearing the field. But the field is clearing you.",
	s_quest: 'New quest available.',
	s_ach: 'Achievement unlocked.',
	s_save: 'Autosave complete.',
	s_crit: 'Warning. Health critical.',
	s_level: 'Level up.',
	s_drop: 'Supply drop incoming.',
	a_title: 'Triple A Sweeper. Remastered. Definitive. Game of the Year Edition.',
	a_complete: 'Mission complete.',
};


/** The subtitle text of a voice line ('' if it has none). */
export function SubtitleOf(voiceId) {
	const line = VOICE_LINES[voiceId];
	return BATCH_ONE_SUBTITLES[voiceId] || (line && line.subtitle) || '';
}
