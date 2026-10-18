# ??? (the whisper)

| | |
|---|---|
| Speaker key | `whisper` (batch-1 id prefix `w`) |
| Radio panel | ??? · ENCRYPTED · channel 0 · `#c9c9d6` (grey) |
| Voice | Kokoro `bm_lewis` (British), speed 0.8, radio chain plus a long echo (`isEerie`) |
| Portrait | A hood with nothing in it but two glowing eyes |
| Side quest | Whispers in the Field ("Find the source of the voice · ???", bearing 0°, distance ???) |

## Personality

An unidentified voice on an encrypted channel, slow and echoing. The game's mystery-box subplot: every AAA game has a cryptic voice that hints at a deeper story. This one is ominous about numbers (GAME_DESIGN.md §9), and its profundities collapse into Minesweeper facts: "Every number tells a story. Most of those stories are about mines."

The quest description says the signal "seems to come from under the tiles", which is the answer.

## Quirks

- **Profound, then literal:** "Fields beneath fields. It's fields all the way down." (`wd_2`), "Every mine is rude." (`wg_1`).
- **Rare:** in chatter it has weight 0.6 (everyone else 1), so it speaks less than anyone.
- **Breaks the spell occasionally:** "Not your mother's calls, though." (`wa_1`); "Except the quest marker. The marker tells everyone." (`wp_2`).

## Story arc

The whisper is the one character with a reveal.

1. **Sector B-4:** the mines were here before us (`w_1`); "the field is clearing you" (`w_3`).
2. **The Dune Sea:** the sand remembers; older fields beneath the dunes.
3. **Da Club:** "The mines are listening to the bass." (`wc_1`)
4. **Station Nord-7:** everything slows down in the cold.
5. **Pathos-4:** "the mines dream of the surface" (`wp_1`).
6. **Mom's Backyard:** "the field came with you" (`wh_1`). Then, as the **last line before the credits**, the second victory line of the campaign: "I am not a ghost, Sweeper. I am not a spy. I am the minefield. I have always been the minefield." (`wh_2`)

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [1 Sector B-4](../levels/1-sector-b4.md) | Caller | `w_1` (quest), `w_2`, `w_3` |
| [2 The Dune Sea](../levels/2-dune-sea.md) | Caller | `wd_1` (quest), `wd_2` |
| [3 Da Club](../levels/3-da-club.md) | Caller | `wc_1` (quest) |
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Caller | `wa_1` (quest) |
| [5 Pathos-4](../levels/5-pathos-4.md) | Caller | `wp_1` (quest), `wp_2` |
| [6 Mom's Backyard](../levels/6-moms-backyard.md) | The reveal | `wh_1` (quest), `wh_2` (2nd victory, before the credits) |

### Shared pool

| Id | Line |
|---|---|
| `wg_1` | Do you hear it, Sweeper? Every click is a question. Every number is an answer. Every mine is rude. |

Repeatable: `w_2`.
