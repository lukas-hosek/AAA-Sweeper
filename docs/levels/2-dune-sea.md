# Chapter 2: The Dune Sea

![The Dune Sea](../images/ch2-dune-sea.jpg)

| | |
|---|---|
| Chapter id | `desert` |
| Card | CHAPTER TWO · Operation: Desert Sweep · 12:14 LOCAL · 44 °C |
| Quest giver | Cmdr. Reyes |
| Card text | "Someone has mined the Dune Sea. Possibly Dr. Kova. Clear it before the sandstorm, or during the sandstorm. Command is flexible." |
| Scenery | `DesertScenery` |
| Tileset | `SandstoneTileset` |
| Music | `desert` (`desert-theme.js`) |
| Achievement | *Sand Between Your Toes* (`ch2`) |

## 1. Original prompt

The Dune Sea came from request 2 (GAME_DESIGN.md §2, excerpt as quoted there):

> "100 more voice messages · bloody screen effect when you step on a mine · an alternate soundtrack for second and third level? They can loop after that · an alternate tileset for second and third level · different backgrounds. Middle eastern desert, the club etc..."

The same request created Da Club, Station Nord-7 and Mom's Backyard, the blood overlay and batch 2 of the voice lines.

## 2. Artistic intention

The desert-warfare chapter every military shooter has, played completely straight visually and undercut on the radio.

- **Scenery:** a hot blue sky over layered dunes, a stone arch gate, ruins and palms, heat shimmer, circling vultures, sand blowing across the screen and a sandstorm rolling in now and then. Concept-art notes: "is this too much sand", "vultures stay", "camels (cut for budget)". The camels survive only in Jenkins's line `jd_3` and a lore postcard.
- **Tileset:** grainy weathered sandstone blocks with the odd crack and chipped corner.
- **Music:** `desert`, 92 BPM. An oud melody in D Hijaz over D and A drones, darbuka (*doum* and *tek*), alternating a braam with a breathy ney between cycles (MUSIC.md §3).
- **Tone:** heat and sand as an excuse for everyone to call in. Reyes admits he doesn't know what he's talking about; Mom sends a care package to "the desert".

## 3. Special mechanics

None of its own. The sandstorm is scenery only: Reyes's card text and `rd_3` treat it as a threat, and nothing happens.

## 4. Cast and unique voice lines

Announcer: `a_ch2` "Chapter two. The Dune Sea."
Opening line: `rd_start` (Reyes). Chatter opens with `kd_1`, `dd_1`. Favourite speakers: Reyes and Jenkins.

### [Cmdr. Reyes](../characters/reyes.md)

| Id | Line |
|---|---|
| `rd_start` | Sweeper, Overlord. Welcome to the Dune Sea. It's 112 degrees, and the mines are hotter. Follow the marker. |
| `rd_1` | The sand shifts every night, Sweeper. Which means the mines shift. Which means I have no idea what I'm talking about. |
| `rd_2` | Drink water, Sweeper. Regenerating health doesn't work if you're dehydrated. It does, actually. But drink water. |
| `rd_3` | Satellite shows a sandstorm moving in. Our recommendation is to keep clicking. |
| `rd_win` | Desert sector cleared. Good work, Sweeper. Shake out your boots. We're moving you somewhere with a dress code. *(victory)* |
| `r_win2` | Field clear. That's another one for the history books. Small history books. Pamphlets. *(second victory line, on the results screen)* |

### [Pvt. Jenkins](../characters/jenkins.md)

| Id | Line |
|---|---|
| `jd_1` | Sweeper, I've got sand in places I didn't know I had places. |
| `jd_2` | Is that an oasis? No, it's a mirage. No, wait, it's the quest marker. |
| `jd_3` | I tried to flag a mine and it turned out to be a camel. He was cool about it. |

### [Dr. Mirela Kova](../characters/kova.md)

| Id | Line |
|---|---|
| `kd_1` | Mirela again. I'm in the desert too. Small world. I followed you. For science. *(quest: Neural Interface Upgrade)* |
| `kd_2` | The neural interface now comes in a desert edition. It's beige. Same price. |

### [Big Dez](../characters/dez.md)

| Id | Line |
|---|---|
| `dd_1` | Sweeper, I can see you on my phone. You're in a desert. Why are you in a desert? The club is literally not in the desert. *(quest: Get Yo Ass In Da Club)* |
| `dd_2` | Okay, new plan. When you're done with the sand, we do a desert rave. I'm calling it Dune Bass. |

### [Mom](../characters/mom.md)

| Id | Line |
|---|---|
| `md_1` | Sweetie, are you wearing sunscreen? You burn so easily. Remember the beach in 2009? *(quest: Call Your Mother)* |
| `md_2` | I sent you a care package. It has socks and a hat. I didn't know where to send it, so I sent it to the desert. |

### [Quartermaster Pryce](../characters/quartermaster-pryce.md)

| Id | Line |
|---|---|
| `qd_1` | Quartermaster here. Sand-proof flags now available. Regular flags are also sand-proof. But these ones say so. *(quest: Premium Flag Collector)* |
| `qd_2` | Desert camouflage flag skin, Sweeper. It's invisible against the sand. Great for when you want to lose your flags. |

### [??? (the whisper)](../characters/whisper.md)

| Id | Line |
|---|---|
| `wd_1` | The sand remembers every step, Sweeper. Even the ones that went boom. *(quest: Whispers in the Field)* |
| `wd_2` | Beneath the dunes there are older fields. Fields beneath fields. It's fields all the way down. |
