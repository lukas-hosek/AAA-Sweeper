# Pvt. Jenkins

| | |
|---|---|
| Speaker key | `jenkins` (batch-1 id prefix `j`) |
| Radio panel | Pvt. Jenkins · SQUAD · channel 3 · `#8fb8ff` (blue) |
| Voice | Kokoro `am_liam`, speed 1.15, radio chain |
| Portrait | Helmet with goggles, big smile |
| Concept-art note | "helmet 2 sizes too big" |
| Side quest | None |

## Personality

The over-eager squadmate every shooter gives you. Earnest, enthusiastic and useless (GAME_DESIGN.md §9). He cheers the Sweeper's every click, holds positions by standing still, and voices the player's own fan club. He is never cynical: everything amazes him.

## Quirks

- **The Sweeper's biggest fan:** "I couldn't have clicked that better myself!" (`j_1`); he founded a fan club of one: "the president, the treasurer, and the snacks" (`jg_2`).
- **Redundant help:** he marked the safe tile "on your HUD. And on your compass. And on the minimap. And in the sky." (`j_2`)
- **Licks cold metal:** "I licked a flagpole. Now I live here." (`ja_1`). Lindqvist reports he is still attached to a tile (`pa_6`).
- **Collectibles:** "That's one of four hundred!" (`j_lore`). There are 13.
- **Philosophy:** "how does the one know?" (`jg_1`)

## Story arc

Jenkins doesn't develop so much as drift from one misadventure to the next, slowly realising he isn't much of a soldier.

1. **Sector B-4:** marking tiles, holding position, following the Sweeper who follows the marker.
2. **The Dune Sea:** a favourite speaker. Sand everywhere, a mirage that is the quest marker, a camel he tried to flag (`jd_3`).
3. **Da Club:** discovers he is better at dancing than at soldiering (`jc_1`); "cool hat" (`jc_2`).
4. **Station Nord-7:** stuck to a flagpole; his regenerating health is frozen (`ja_2`).
5. **Pathos-4:** water in his helmet (`jp_1`), a fish with a quest marker (`jp_2`); after the flood, proud of holding his breath for two minutes (`jp_3`).
6. **Mom's Backyard:** Mom gives him a sandwich; she is "the best commander I've ever had" (`jh_1`).

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [1 Sector B-4](../levels/1-sector-b4.md) | Caller | `j_2`, `j_3`, `j_4` |
| [2 The Dune Sea](../levels/2-dune-sea.md) | Favourite speaker | `jd_1`, `jd_2`, `jd_3` |
| [3 Da Club](../levels/3-da-club.md) | Caller | `jc_1`, `jc_2` |
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Caller | `ja_1`, `ja_2` |
| [5 Pathos-4](../levels/5-pathos-4.md) | Opens the chatter | `jp_1`, `jp_2`, `jp_3` (after the flood) |
| [6 Mom's Backyard](../levels/6-moms-backyard.md) | Caller | `jh_1` |

### Event barks (any chapter)

| Id | When | Line |
|---|---|---|
| `j_1` | Sometimes after a small reveal (1–2 tiles) | Whoa, nice click, Sweeper! I couldn't have clicked that better myself! |
| `j_hit` | Mine hit (random pick, with Reyes) | Sweeper! Are you okay? You look... exploded. |
| `j_low` | Health below 40 | Sweeper, you're bleeding pixels! Stay away from the mines! |
| `j_area` | 20+ tiles in one click (with Reyes) | Whoa! Did you see all those tiles go? That was beautiful, man! |
| `j_idle` | Idle for 13 s (with Reyes) | Uh, Sweeper? Hello? Are we waiting for something? Should I wait too? I'll wait too. |
| `j_lore` | Lore fragment found (with Reyes) | Ooh, a collectible! That's one of four hundred! |
| `j_respawn` | After respawning | You're back! I told everyone you'd respawn. Nobody believed me. Well, Kova did. |

### Shared pool

| Id | Line |
|---|---|
| `jg_1` | Sweeper, do you ever think about how the numbers know? Like, how does the one know? |
| `jg_2` | I started a fan club for you. It's just me so far. I'm the president, the treasurer, and the snacks. |

Repeatable: `j_2`, `j_3`, `j_4`, `jd_3`, `ja_1`, `jg_1`.
