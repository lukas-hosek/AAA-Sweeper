# Mom

| | |
|---|---|
| Speaker key | `mom` (batch-1 id prefix `m`) |
| Radio panel | Mom · HOME · MOBILE · channel 1 · `#ffb48a` (peach) |
| Voice | Kokoro `af_heart`, speed 1.0, **phone** chain (narrower band than the radio, `isPhone`) |
| Portrait | Curls and earrings |
| Concept-art note | "always calling" |
| Side quests | Call Your Mother ("She's worried. She's always worried. It's been eleven days."); in chapter 6, Dinner Is Ready |

## Personality

The Sweeper's mother, calling on her mobile. Loving, anxious, practical, and completely uninterested in the military framing: she doesn't understand the job, but please don't step on anything (`m_1`). "Mom worries" (GAME_DESIGN.md §9). She is the only character who treats the Sweeper as a person rather than an asset or a customer.

## Quirks

- **Worry tuned to the location:** sunscreen in the desert (`md_1`), "Are you making friends?" at the club (`mc_1`), "you can't swim very well" under water (`mp_1`).
- **Care packages:** socks and a hat sent "to the desert" (`md_2`), a very long scarf to mark the mines with (`ma_1`).
- **Family news:** the cousin's wedding (`m_2` → `mh_2`), Dad asking about a pension plan (`m_3`), Dad "gardening" with mines (chapter 6 card, `mh_start`).
- **She hears the explosions.** The first mine hit in any field makes her call 10 s later: "I saw on the news there was an explosion. Was that you? Call me back." (`m_4`)
- **The forum:** she joined one about minesweeping; "Everyone there is very angry about the number eight." (`mg_1`)
- A loading-screen tip: "Health does not regenerate faster at home. Mom says it does."

## Story arc

Mom's arc is the campaign's emotional through-line: five chapters of calls that end with the Sweeper coming home.

1. **Sector B-4:** first call, the wedding invitation, Dad's question.
2. **The Dune Sea:** sunscreen and a care package.
3. **Da Club:** worried about the club (`mc_1`), then she turns up in it, on Dez's guest list (`mc_2`; DJ Detonator gives her a shout-out, `dj_5`).
4. **Station Nord-7:** a knitted scarf.
5. **Pathos-4:** "Remember the lake?" (`mp_1`); after the flood, "Your voice sounds bubbly... Breathe, honey." (`mp_2`, flood-only).
6. **Mom's Backyard:** the quest giver. "You're home!" She cooks, guards her tulips, invites Dez and feeds Command and Jenkins. Her victory line, "Bring your friend with the radio", leads into the whisper's reveal and the credits.

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [1 Sector B-4](../levels/1-sector-b4.md) | Caller | `m_1` (quest), `m_2`, `m_3` |
| [2 The Dune Sea](../levels/2-dune-sea.md) | Caller | `md_1` (quest), `md_2` |
| [3 Da Club](../levels/3-da-club.md) | Opens the chatter | `mc_1` (quest), `mc_2` |
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Caller | `ma_1` (quest) |
| [5 Pathos-4](../levels/5-pathos-4.md) | Caller | `mp_1` (quest), `mp_2` (after the flood) |
| [6 Mom's Backyard](../levels/6-moms-backyard.md) | Quest giver, favourite | `mh_start` (opening), `mh_1` (Dinner Is Ready), `mh_2`, `mh_3`, `mh_4`, `mh_win` (victory) |

### Event barks (any chapter)

| Id | When | Line |
|---|---|---|
| `m_4` | 10 s after the first mine hit of a field | I saw on the news there was an explosion. Was that you? Call me back. |

### Shared pool

| Id | Line |
|---|---|
| `mg_1` | Sweetie, I joined a forum about minesweeping. Everyone there is very angry about the number eight. |

Repeatable: `m_2`, `m_3`, `mh_3`.
