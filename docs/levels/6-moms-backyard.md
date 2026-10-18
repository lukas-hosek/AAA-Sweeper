# Chapter 6: Mom's Backyard

![Mom's Backyard](../images/ch6-moms-backyard.jpg)

| | |
|---|---|
| Chapter id | `home` |
| Card | CHAPTER SIX · Operation: Come Home · 18:30 LOCAL · DINNER SOON |
| Quest giver | Mom |
| Card text | "You finally came home. Your father was gardening. With mines. Clear the lawn before dinner gets cold." |
| Scenery | `BackyardScenery` |
| Tileset | `LawnTileset` |
| Music | `home` (`home-theme.js`) |
| Achievement | *Home Sweet Mine* (`ch5`: the id predates Pathos-4, when this was chapter 5) |

## 1. Original prompt

Mom's Backyard came from request 2 as the last chapter (GAME_DESIGN.md §2, excerpt as quoted there):

> "100 more voice messages · bloody screen effect when you step on a mine · an alternate soundtrack for second and third level? They can loop after that · an alternate tileset for second and third level · different backgrounds. Middle eastern desert, the club etc..."

Request 6 gave it its own music and tiles:

> "Polar base and Mom's house do not have their own themes? … Make it so. Also, unique tilesets for those levels."

It was chapter 5 until request 7 inserted Pathos-4 before it.

## 2. Artistic intention

The homecoming finale. After five chapters of Mom calling, the player finally goes home, and home is also mined. The quieter, warmer scale is the joke: the epic campaign ends in a suburban garden with dinner getting cold.

- **Scenery:** a warm suburban sunset. Mom's house with a flickering TV in the window and a smoking chimney, a picket fence, a garden gnome, tulips, fireflies and birds. Concept-art notes: "gnome is canon", "tulips: do NOT step", "TV always on".
- **Tileset:** freshly mowed lawn with mowing stripes (darker on every other column) and a few flowers; opened tiles are dug-up soil with pebbles.
- **Music:** `home`, 88 BPM, swung. A lazy lo-fi groove in F: e-piano seventh chords, a walking triangle bass, shaker and soft kick, and a whistled melody on alternate phrases (MUSIC.md §3).
- **Tone:** domestic. Everyone the player met turns up: Dez throws the afterparty here, Command accepts a casserole, Jenkins declares Mom the best commander he has had.

## 3. Special mechanics

- **The finale:** clearing this chapter plays **both** victory lines in full (Mom, then the whisper's reveal `wh_2`), then rolls the credits instead of a NEXT CHAPTER button. Afterwards the campaign continues as New Game+ from chapter 1.
- **Mom gives a different quest:** her first line here hands out Dinner Is Ready instead of Call Your Mother, and Call Your Mother's objective changes to "Visit in person instead".

## 4. Cast and unique voice lines

Announcer: `a_ch6` "Chapter six. Mom's Backyard."
Opening line: `mh_start` (Mom). Chatter opens with `mh_1`, `rh_1`. Favourite speaker: Mom.

### [Mom](../characters/mom.md)

| Id | Line |
|---|---|
| `mh_start` | You're home! Oh, I'm so happy! Wipe your feet. Not there! There's a mine there. Your father was gardening. |
| `mh_1` | I made your favorite dinner. It will be ready when you clear the lawn. No pressure, sweetie. *(quest: Dinner Is Ready)* |
| `mh_2` | Your cousin is here. She got married. You missed it. She's not mad. She's a little mad. |
| `mh_3` | Don't step on my tulips. Or the mines. But mostly the tulips. |
| `mh_4` | Your old room is exactly how you left it. Except for the mines. Those are new. |
| `mh_win` | My baby cleared the whole yard! Come inside, dinner's getting cold. Bring your friend with the radio. *(victory)* |

### [??? (the whisper)](../characters/whisper.md)

| Id | Line |
|---|---|
| `wh_1` | You came home, Sweeper. But the field came with you. The field always comes with you. *(quest: Whispers in the Field)* |
| `wh_2` | I am not a ghost, Sweeper. I am not a spy. I am the minefield. I have always been the minefield. *(second victory line: the last line before the credits)* |

### [Cmdr. Reyes](../characters/reyes.md)

| Id | Line |
|---|---|
| `rh_1` | Sweeper, Overlord. I'm told this is your mother's backyard. I want you to treat it like any other warzone. With respect. |
| `rh_2` | Your mother has offered Command a casserole. We have accepted. Morale is very high. |

### [Big Dez](../characters/dez.md)

| Id | Line |
|---|---|
| `dh_1` | Yo! Sweeper! Your mom invited me! This backyard is sick. We're doing the afterparty here. *(quest: Get Yo Ass In Da Club)* |

### [Dr. Mirela Kova](../characters/kova.md)

| Id | Line |
|---|---|
| `kh_1` | I'm sorry I mined your mother's garden. I thought it was a test site. It was a vegetable patch. *(quest: Neural Interface Upgrade)* |

### [Pvt. Jenkins](../characters/jenkins.md)

| Id | Line |
|---|---|
| `jh_1` | Your mom gave me a sandwich. Sweeper. Your mom is the best commander I've ever had. |

### [Quartermaster Pryce](../characters/quartermaster-pryce.md)

| Id | Line |
|---|---|
| `qh_1` | Quartermaster here. Garden gnome flag skin available. It judges you silently. *(quest: Premium Flag Collector)* |

### Unused

`a_ch5` ("Chapter five. Mom's Backyard.") is the old chapter card from before Pathos-4 took the number 5. It is still baked and in the manifest, but nothing plays it; `a_ch6` replaced it.
