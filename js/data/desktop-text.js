/**
 * desktop-text.js: the text of the fake desktop: the patch notes and the message boxes behind the icons.
 */


export const PATCH_NOTES = `TRIPLE A SWEEPER — PATCH NOTES v1.0.7 (DAY ONE)

GAMEPLAY
- Mines are now 14% more explosive.
- Removed the "lose" condition based on player feedback.
- Health now regenerates. Please stand near a wall.
- Fixed a bug where clicking a tile revealed the tile.
  (This was not a bug. It has been restored.)
- The quest marker now marks the quest.

NARRATIVE
- Added 340 lines of radio dialogue.
- Big Dez will now ask you to come to the club
  roughly 40% less often (from 100%).
- Dr. Kova is sorry.

ECONOMY
- Flags remain free. For now.
- Added the Chrome Flag. It is very shiny.

KNOWN ISSUES
- The club cannot be reached on foot.
- Mom keeps calling.
- Some numbers may be numbers.

Thank you for playing. Please leave a review.`;


// The message box each desktop icon opens (by its data-opens value). `text` is markup.
export const ICON_MESSAGES = {
	pc: {
		title: 'My Computer',
		text: 'My Computer is busy downloading the Triple A Sweeper day-one patch. Please try again in 74.2 GB.',
		icon: 'icon-warning',
	},
	docs: {
		title: 'My Documents',
		text: 'This folder is empty. Your save games are in the cloud. You do not have Cloud Saves+.',
		icon: 'icon-info',
	},
	bin: {
		title: 'Recycle Bin',
		text: 'The Recycle Bin contains 1 item: "Single-player games without an online requirement".',
		icon: 'icon-info',
	},
};
