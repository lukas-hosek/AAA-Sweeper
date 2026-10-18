# Characters

One file per speaker in `CHARACTERS` (`js/data/characters.js`), plus the silent player character. Each file covers personality, quirks, story arc, where the character appears, and the full text of their lines that are not tied to one chapter (event barks, shared pool). Chapter-specific lines are quoted in full in the [level files](../levels/README.md) and only referenced here by id.

| Key | Character | Role | Featured in | File |
|---|---|---|---|---|
| `reyes` | Cmdr. Reyes, "Overlord" | Commanding officer, main quest giver | Every chapter; quest giver of 1, 2, 5 | [reyes.md](reyes.md) |
| `kova` | Dr. Mirela Kova | Neurotech Labs scientist who double-crossed you and keeps upselling | Every chapter; favourite in 1 | [kova.md](kova.md) |
| `dez` | Big Dez | Owner of Da Club | Every chapter; quest giver of 3 | [dez.md](dez.md) |
| `dj` | DJ Detonator | The voice on Da Club's PA | Da Club only | [dj-detonator.md](dj-detonator.md) |
| `qm` | Quartermaster Pryce | Sells flags | Every chapter | [quartermaster-pryce.md](quartermaster-pryce.md) |
| `mom` | Mom | Worries, calls, cooks | Every chapter; quest giver of 6 | [mom.md](mom.md) |
| `jenkins` | Pvt. Jenkins | Earnest, useless squadmate | Every chapter; favourite in 2 | [jenkins.md](jenkins.md) |
| `whisper` | ??? | Encrypted voice from under the tiles; the minefield itself | Every chapter, rarely | [whisper.md](whisper.md) |
| `prof` | Prof. Lindqvist | Glaciologist at Station Nord-7 | Station Nord-7 only; quest giver of 4 | [prof-lindqvist.md](prof-lindqvist.md) |
| `halcyon` | HALCYON | Pathos-4's station AI | Pathos-4 only | [halcyon.md](halcyon.md) |
| `sys` | SYSTEM | Game announcements (achievement, autosave, level up...) | Everywhere | [system.md](system.md) |
| `announcer` | The announcer | Trailer voice: title and chapter cards | Title, chapter cards, mission complete | [announcer.md](announcer.md) |
| (none) | The Sweeper | The player character; never speaks | Everywhere | [sweeper.md](sweeper.md) |

Voices, speeds and the radio treatment are in [VOICES.md](../VOICES.md#the-cast-voice-in-linespy); the writing rules are in [GAME_DESIGN.md §9](../GAME_DESIGN.md#9-tone-and-writing-rules).

## The story, in one paragraph

Command (Reyes) sends the Sweeper from field to field with a glowing marker that makes the job trivial. Dr. Kova, who double-crossed the Sweeper, apologises and upsells a neural-interface subscription while slowly admitting she planted the mines: in the battlefield, on the dance floor, in Pathos-4 (which she designed) and in Mom's garden. Big Dez begs the Sweeper to come to the club until the club comes to them, then hosts chapter 3 and follows the Sweeper everywhere with rave plans. Mom calls, worries and finally gets the Sweeper home for dinner, where everyone ends up. Throughout, an encrypted voice speaks ominously about numbers, and as the last line before the credits reveals that it is the minefield itself.

## Running threads across characters

- **Who mined everything:** Kova (`k_4`, `kc_1`, `kp_2`, `kh_1`), Dez asks her directly (`dc_4`), the desert card suspects her; in the end the whisper claims to *be* the minefield (`wh_2`).
- **The guest list:** Dez puts the Sweeper on it three times (`d_3`), the bouncer apologises (`dc_3`), Mom is on it (`mc_2`, `dj_5`).
- **The cousin's wedding:** invitation unanswered (`m_2`), missed (`mh_2`).
- **Jenkins and cold metal:** licks a flagpole (`ja_1`); Lindqvist reports him still attached to a tile (`pa_6`).
- **The casserole:** a lore recipe card ("Serves 4, or 1 sweeper"), then Command accepts one (`rh_2`).

## Keeping these files current

When a character's lines, arcs, quests or treatment change, update their file in the same change (see CLAUDE.md). A new speaker gets a new file and a row above.
