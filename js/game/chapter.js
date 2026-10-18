/**
 * chapter.js: one chapter of the campaign.
 */


/**
 * A chapter: its texts and voice lines, plus the tileset, scenery and music it is played with.
 * The registry in chapters.js creates one per chapter; every Field points at the chapter it plays.
 */
export class Chapter {
	id;                 // Short id: picks the chatter lines and names the screenshots (battle, desert, club, arctic, pathos, home)
	name;               // Name of the location ("Sector B-4")
	chapterLabel;       // "CHAPTER ONE"
	operation;          // "Operation: Clean Sweep"
	localTime;          // Flavour line on the chapter card
	questGiver;         // Shown in the quest log
	description;        // Briefing in the quest log
	announcerLine;      // Voice id played as the chapter starts ...
	openingLine;        // ... and the one after it
	victoryLines;       // Two voice ids: right after the clear, and later (on the results screen, or before the credits)
	achievement;        // Achievement id for clearing it, or null
	musicTheme;         // Name of the MusicTheme played on the board
	tileset;            // The Tileset its tiles are drawn with
	sceneryClass;       // The Scenery subclass that paints its background
	screenClass;        // Extra CSS class on #game while it is played ('' for none)
	isClub;             // Da Club: the club is here from the start
	floods;             // Pathos-4: the base floods on a timer and the breath meter takes over


	/** Takes every member above by name. */
	constructor(properties) {
		Object.assign(this, properties);
	}


	/** A fresh, unbuilt scenery for this chapter's background. */
	CreateScenery() {
		return new this.sceneryClass();
	}
}
