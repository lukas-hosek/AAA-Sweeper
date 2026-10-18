# Levels

One file per chapter of the campaign (`CHAPTERS` in `js/game/chapters.js`). Each file covers the original request that created the level, what it is trying to look and sound like, its special mechanics, and every voice line that belongs only to it.

| # | Chapter | Id | Operation | Quest giver | File |
|---|---|---|---|---|---|
| 1 | Sector B-4 | `battle` | Clean Sweep | Cmdr. Reyes | [1-sector-b4.md](1-sector-b4.md) |
| 2 | The Dune Sea | `desert` | Desert Sweep | Cmdr. Reyes | [2-dune-sea.md](2-dune-sea.md) |
| 3 | Da Club | `club` | Get In Da Club | Big Dez | [3-da-club.md](3-da-club.md) |
| 4 | Station Nord-7 | `arctic` | Cold Sweep | Prof. Lindqvist | [4-station-nord-7.md](4-station-nord-7.md) |
| 5 | Pathos-4 | `pathos` | Deep Sweep | Cmdr. Reyes | [5-pathos-4.md](5-pathos-4.md) |
| 6 | Mom's Backyard | `home` | Come Home | Mom | [6-moms-backyard.md](6-moms-backyard.md) |

The people are described in [../characters/](../characters/README.md). The summary table of all chapters is in [GAME_DESIGN.md §4](../GAME_DESIGN.md#4-chapters).

## How a chapter's voice lines are used

These rules apply to every chapter, so the level files don't repeat them.

- **Chapter start:** the announcer reads the chapter card (`announcerLine`) 0.4 s after the fade, and the quest giver's `openingLine` follows at 3.3 s.
- **Chatter:** `CHAPTER_CHATTER.<id>` in `js/data/chatter.js`.
  - The chapter's `openingLines` play first, in order.
  - Then a speaker is picked by weight and their arc continues one line at a time. Favourite speakers weigh 2.2 (or the chapter's `favouriteWeight`), the whisperer 0.6, everyone else 1. The same speaker never speaks twice in a row.
  - When every arc is used up, the shared pool plays (`SHARED_CHATTER`), then the repeatable lines (`REPEATABLE_LINES`) forever.
  - The radio chatter setting (Off / Normal / Constant / Unbearable) sets the pace.
- **Side quests:** some lines add a quest to the quest log when they finish (`SIDE_QUEST_AFTER_LINE`). A quest already in the log is not added twice.
- **Victory:** "Mission complete" (`a_complete`), then the first of the chapter's `victoryLines` at 2 s. The second victory line plays on the results screen, 2.4 s after it appears, unless the player has already moved on. When the field number is 6 or higher (Mom's Backyard, and every chapter in New Game+), both lines play in full and then the credits roll instead (`js/game/mission-outcome.js`).
- **Event barks** (hits, flags, idling, deaths, lore, halfway...) are the same in every chapter. They are listed in the character files, under each speaker.

## Keeping these files current

When a chapter, its chatter wiring or one of its lines changes, update its file here in the same change (see CLAUDE.md). Quote lines by their **subtitle** text (`js/data/subtitles.js` for batch 1, otherwise the 4th field in `tools/tts/lines.py`, or the TTS text when that is `None`).
