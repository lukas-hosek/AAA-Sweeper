# Prof. Lindqvist

| | |
|---|---|
| Speaker key | `prof` (ids `pa_<n>`) |
| Radio panel | Prof. Lindqvist · STATION NORD-7 · channel 9 · `#9ff3ff` (ice blue) |
| Voice | Kokoro `bf_alice` (British), speed 0.98, radio chain |
| Portrait | Beanie with a pompom, round glasses |
| Concept-art note | "studies ice" |
| Side quest | Ice Core Samples ("Collect ice core samples (0/12) · Not implemented") |

## Personality

A glaciologist who has spent eleven winters alone at Station Nord-7. Precise, dry and deadpan (GAME_DESIGN.md §9, "Lindqvist is a dry scientist"), speaking in complete sentences without contractions. She did not ask for mines. Nobody asks for mines. Her humour is entirely unintentional on her side: she reports absurd things as data, and the isolation shows through the cracks.

## Quirks

- **Scientific framing of everything:** the mines are hibernating (`pa_2`), 90 % of each mine is below the surface, and so is the other 10 % (`pa_4`), the mines were not peer reviewed (`pa_14`).
- **Timescales:** progress in millimetres per century (`pa_11`), a skill lichen that grows one point every forty years (`pa_15`), day 4,012 of her field notes (`pa_24`).
- **Naming:** every mine is Ingrid (`pa_9`).
- **Loneliness:** the first visitor who didn't ask if it is cold (`pa_5`); talking to "penguins" at the wrong pole (`pa_21`).
- **Career anxiety:** a rejected grant, a press release scheduled before sunrise, her career and lunch in the freezer, a mine frozen in an ice core as "a publication" (`pa_23`).
- **Calls out the game:** a "stealth section" while following a glowing orange marker in the polar night (`pa_19`); regenerating health is "Interesting" (`pa_13`).
- **Frozen coffee** echoes Reyes's `ra_start`.

## Story arc

She is a one-chapter character with the biggest single arc in the game: 24 lines, all in [Station Nord-7](../levels/4-station-nord-7.md). Request 11 asked for "about 20 more" lines for her, "used only in her level".

- `pa_1` (her introduction) always plays first; the other 23 are **shuffled per run** (`shuffledArcs`), and she has chatter weight 4, so she dominates the radio but a field only hears part of her lines.
- Her lines mention the rest of the cast: Jenkins attached to a tile (`pa_6`), Dez asking about a VIP section (`pa_10`), Command's stealth section (`pa_19`).
- She is the quest giver on the chapter card, but the chapter's opening briefing and victory belong to Reyes. She never speaks outside her chapter.

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Quest giver, favourite (weight 4), opens the chatter | `pa_1` (quest), `pa_2` … `pa_24` (shuffled) |

Repeatable: `pa_2`, so it can recur in later chapters once their lines run out.
