# Dr. Mirela Kova

| | |
|---|---|
| Speaker key | `kova` (batch-1 id prefix `k`) |
| Radio panel | Dr. Mirela Kova · NEUROTECH LABS · channel 7 · `#ff6fb1` (pink) |
| Voice | Kokoro `af_bella`, speed 1.0, radio chain |
| Portrait | Long hair, rectangular glasses that catch the light |
| Concept-art note | "sorry (not sorry)" |
| Side quest | Neural Interface Upgrade ("Visit Dr. Kova's office · 3.2 km") |

## Personality

A Neurotech Labs scientist and the game's monetisation made flesh. She double-crossed the Sweeper before the game began, and every call is an apology that turns into a sales pitch. She is warm, chatty and entirely unrepentant.

- **She always upsells** (GAME_DESIGN.md §9). Whatever the chapter, the neural interface has a new edition: desert (beige, same price), party mode (9.99), heated (slightly on fire), waterproof (damp tolerant).
- **"No strings attached. Mostly."** Her apologies carry fine print.
- **Confessions in passing:** she drops that she planted the mines as if mentioning the weather.

She comes from the original brief: "Hey! I'm sorry for double crossing you. When you have time, come by my office and I'll upgrade that minesweeping neural interface for you." That line is `k_1`, her first.

## Quirks

- **9.99 a month.** The subscription price recurs (`k_3`, `kc_2`); a lore fragment is her receipt ("interface upgrade (trial), 9.99, recurring").
- **The upgrade is useless:** it shows you which tiles are safe, which the quest marker already does (`k_5`).
- **Spatial reasoning is not her area:** she meant to mine the parking lot, not the dance floor (`kc_1`), and thought Mom's vegetable patch was a test site (`kh_1`).
- **Ads in your dreams:** the subscription now includes them (`kg_1`).

## Story arc

Kova's arc is a slow confession that she is behind the mines.

1. **Sector B-4:** apology and offer (`k_1`), "no strings attached, mostly" (`k_2`), the subscription fee (`k_3`), "I may have also planted some of these mines" (`k_4`), and the upgrade turns out to be the quest marker (`k_5`).
2. **The Dune Sea:** followed the Sweeper to the desert "for science" (`kd_1`). Command's card text: "Possibly Dr. Kova."
3. **Da Club:** Dez asks on air whether it was her (`dc_4`); she admits mining the dance floor by mistake (`kc_1`).
4. **Station Nord-7:** a heated interface, slightly on fire (`ka_1`).
5. **Pathos-4:** reveals she designed the flooding base: "The leak is a feature. It's called immersion." (`kp_2`)
6. **Mom's Backyard:** finally a plain apology, for mining Mom's garden (`kh_1`).

At the end the whisper claims to *be* the minefield (`wh_2`), which leaves open how much of it was really Kova.

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [1 Sector B-4](../levels/1-sector-b4.md) | Favourite speaker, opens the chatter | `k_1` (quest), `k_2`, `k_3`, `k_4`, `k_5` |
| [2 The Dune Sea](../levels/2-dune-sea.md) | Opens the chatter | `kd_1` (quest), `kd_2` |
| [3 Da Club](../levels/3-da-club.md) | Caller | `kc_1` (quest), `kc_2` |
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Caller | `ka_1` (quest) |
| [5 Pathos-4](../levels/5-pathos-4.md) | Caller | `kp_1` (quest), `kp_2` |
| [6 Mom's Backyard](../levels/6-moms-backyard.md) | Caller | `kh_1` (quest) |

### Event barks (any chapter)

| Id | When | Line |
|---|---|---|
| `k_dead` | 2.6 s after death | Don't worry, Sweeper. I can rebuild you. Better. Faster. With a monthly subscription. |

### Shared pool

| Id | Line |
|---|---|
| `kg_1` | Small update. The neural interface subscription now includes ads. They play directly in your dreams. |

Repeatable: `k_2`, `k_4`, `kg_1`.
