# Big Dez

| | |
|---|---|
| Speaker key | `dez` (batch-1 id prefix `d`) |
| Radio panel | Big Dez · DA CLUB · channel 69 · `#9bff4a` (green) |
| Voice | Kokoro `am_puck`, speed 1.12, radio chain |
| Portrait | Cap with a long brim, gold chain with a pendant |
| Concept-art note | "LOUDER" |
| Side quest | Get Yo Ass In Da Club ("Get in da club · 2,400 km") |

## Personality

The owner of Da Club. Loud, warm, relentless, and interested in exactly one thing: getting the Sweeper into the club (GAME_DESIGN.md §9, "Dez only cares about the club"). He doesn't care that there is a war on, a desert, a glacier or an ocean; each is a venue.

He comes from the original brief: "Yoo, Sweeper, where you bneen? Get yo ass in da club immediately!" That line is `d_1`, his first, and it became a chapter.

## Quirks

- **The guest list:** he put the Sweeper on it three times; "The bouncer thinks you're a myth." (`d_3`). The bouncer later apologises, in tears (`dc_3`).
- **"I'm not mad. I'm just saying."** He is hurt, not angry (`d_4`, `dc_4`).
- **Every place is a party:** Dune Bass in the desert (`dd_2`), an ice bar at −40 (`da_1`), an underwater rave (`dp_1`), the afterparty in Mom's backyard (`dh_1`).
- **Lamination is serious** (`dg_1`). A store loot item: "Voice line: Big Dez says your name (wrong)".
- The patch notes boast he now asks you to come to the club "roughly 40% less often (from 100%)".

## Story arc

1. **Sector B-4:** five escalating calls (`d_1`–`d_5`). The last one, "If you won't come to the club, the club is coming to you!", **triggers the club night**: for 24 s the club theme and dance-floor lighting take over the chapter, "THE CLUB HAS ARRIVED", +500 XP and *Club Kid*. His side quest then reads "The club came to you".
2. **The Dune Sea:** watching the Sweeper's location on his phone, baffled by the desert (`dd_1`).
3. **Da Club:** the payoff. He is the quest giver: "YO! YOU MADE IT!" (`dc_start`), asks who mined his floor (`dc_4`, pointing at Kova), and declares the Sweeper VIP for life, with the drinks on Overlord (`dc_win`).
4. **Station Nord-7, Pathos-4:** short calls with new party ideas. Lindqvist reports he called the station about a VIP section (`pa_10`).
5. **Mom's Backyard:** Mom invited him; he moves the afterparty to the backyard (`dh_1`).
6. **After the credits:** he gets the last word in the game. On the player's own credit card, after the roll, he says goodbye with `d_win` ("Yo, you done? You done? Club. Now. I'm sending a car.", `FAREWELL_LINE` in `js/scenes/credits/credits-scene.js`).

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [1 Sector B-4](../levels/1-sector-b4.md) | Favourite speaker, opens the chatter | `d_1` (quest), `d_2`, `d_3`, `d_4`, `d_5` (club night), `d_win` (2nd victory) |
| [2 The Dune Sea](../levels/2-dune-sea.md) | Opens the chatter | `dd_1` (quest), `dd_2` |
| [3 Da Club](../levels/3-da-club.md) | Quest giver, favourite | `dc_start` (opening), `dc_1`, `dc_2`, `dc_3`, `dc_4`, `dc_win` (victory) |
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Opens the chatter | `da_1` (quest) |
| [5 Pathos-4](../levels/5-pathos-4.md) | Caller | `dp_1` (quest) |
| [6 Mom's Backyard](../levels/6-moms-backyard.md) | Caller | `dh_1` (quest) |
| Credits | Farewell | `d_win` |

### Shared pool

| Id | Line |
|---|---|
| `dg_1` | Sweeper! I made you a VIP card! It's laminated! You know how serious lamination is! |

Repeatable: `d_2`, `d_3`, `d_4`, `dc_2`, `dg_1`. (`d_5` is not repeatable, so the club arrives at most once per field.)

Related: [DJ Detonator](dj-detonator.md), his DJ.
