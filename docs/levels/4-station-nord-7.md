# Chapter 4: Station Nord-7

![Station Nord-7](../images/ch4-station-nord7.jpg)

| | |
|---|---|
| Chapter id | `arctic` |
| Card | CHAPTER FOUR · Operation: Cold Sweep · 22:05 LOCAL · −40 °C |
| Quest giver | Prof. Lindqvist |
| Card text | "A research station in the Arctic has found mines under the ice. The professor would like them removed so she can get back to studying ice." |
| Scenery | `ArcticScenery` |
| Tileset | `IceTileset` |
| Music | `arctic` (`arctic-theme.js`) |
| Achievement | *Cold Feet* (`ch4`) |

## 1. Original prompt

Station Nord-7 was built up over three requests (GAME_DESIGN.md §2, excerpts as quoted there).

Request 2 created the chapter, with the desert and the club:

> "100 more voice messages · bloody screen effect when you step on a mine · an alternate soundtrack for second and third level? They can loop after that · an alternate tileset for second and third level · different backgrounds. Middle eastern desert, the club etc..."

Request 6 gave it its own music and tiles:

> "Polar base and Mom's house do not have their own themes? … Make it so. Also, unique tilesets for those levels."

Request 11 made Prof. Lindqvist its star:

> "That doctor from the arctic base … Generate some more, about 20 more. Used only in her level."

## 2. Artistic intention

The polar research station level: isolation, silence and a scientist who has been alone too long. It is the quietest chapter, and the professor's deadpan is the point.

- **Scenery:** a polar night. Aurora curtains (green through teal to violet) sway over a starry sky and mountains, the station's domes and blinking radio mast sit in the snow, a meteor streaks past now and then. Concept-art notes: "aurora = free bloom", "polar bear (DLC)". The polar bear exists only on the radio (`ra_2`, `pa_8`).
- **Tileset:** pale blue blocks of sea ice with frost specks and scratches; frost glints twinkle over hidden tiles.
- **Music:** `arctic`, E minor at 66 BPM. Soft pads, a sub, band-passed wind and a music-box bell melody with inharmonic partials, two alternating patterns, a distant taiko every other phrase (MUSIC.md §3).
- **Tone:** dry scientific understatement. Lindqvist measures progress in millimetres per century and names every mine Ingrid.

## 3. Special mechanics

- **Lindqvist dominates the radio:** her arc has 24 lines with weight 4 (everyone else 1, the whisper 0.6), and it is a **shuffled arc**: `pa_1` (her introduction) always plays first, the other 23 in a random order each run. A normal-length field hears only part of them, so replays sound different.
- **No victory line from her:** the chapter ends with Reyes. Lindqvist never speaks outside this chapter.
- Her side quest, Ice Core Samples, reads "Not implemented" on purpose.

## 4. Cast and unique voice lines

Announcer: `a_ch4` "Chapter Four. Station Nord-7."
Opening line: `ra_start` (Reyes). Chatter opens with `pa_1`, `da_1`. Favourite speaker: Prof. Lindqvist (weight 4).

### [Prof. Lindqvist](../characters/prof-lindqvist.md)

`pa_1`–`pa_4` were in batch 2; `pa_5`–`pa_24` are the 20 lines of request 11 (batch 4).

| Id | Line |
|---|---|
| `pa_1` | Hello, Sweeper. Professor Lindqvist, Station Nord-7. I study ice. I did not ask for mines. Nobody asks for mines. *(quest: Ice Core Samples)* |
| `pa_2` | Fascinating. The mines appear to be hibernating. Please do not wake them. They are grumpy. |
| `pa_3` | The aurora tonight is spectacular. That green light is the solar wind. That orange light is the quest marker. |
| `pa_4` | My research shows that 90% of each mine is below the surface, like an iceberg. The other 10% is also below the surface. |
| `pa_5` | I have been at this station for eleven winters. You are the first visitor who did not ask me if it is cold. Thank you. It is cold. |
| `pa_6` | Please do not lick the tiles. I know it is tempting. Private Jenkins tried. Private Jenkins is still attached to one. |
| `pa_7` | These ice cores are 40,000 years old. Every layer is one year. This layer here is the year someone buried mines in my glacier. A very bad year. |
| `pa_8` | Sweeper, a polar bear has been watching your progress on the station monitors. He seems very invested. Please do not disappoint him. |
| `pa_9` | I have named all the mines. That one is Ingrid. That one is also Ingrid. I ran out of names quite early. |
| `pa_10` | Your friend from the club called the station. He asked if we have a VIP section. We do. It is the only room with heating. |
| `pa_11` | In my field, we measure progress in millimetres per century. You are moving much faster than that. Honestly, it is a little upsetting. |
| `pa_12` | People say the Arctic is empty. It is not empty, Sweeper. It is full of silence. And, as of this week, mines. |
| `pa_13` | Your health is regenerating. Interesting. Up here, nothing regenerates. Except the paperwork. |
| `pa_14` | I applied for a grant to study the mines. It was rejected. The committee said the mines were not peer reviewed. |
| `pa_15` | I am told you have a skill tree. We have no trees up here. We have a skill lichen. It grows one point every forty years. |
| `pa_16` | Please be careful near the freezer behind you. My entire career is in that freezer. Also my lunch. |
| `pa_17` | It is now −40° outside. That is the only temperature where Celsius and Fahrenheit agree. It is also where I stop agreeing with anyone. |
| `pa_18` | Every ice crystal is unique. Every mine is identical. Scientifically, I find that deeply disappointing. |
| `pa_19` | Command says this is a stealth section. Sweeper, you are following a glowing orange quest marker. In the polar night. They can see you from orbit. |
| `pa_20` | The night here lasts four months. Please try to finish before sunrise. I have already scheduled the press release. |
| `pa_21` | I used to talk to the penguins out there. Then I remembered that penguins live at the other pole. I still do not know who I was talking to. |
| `pa_22` | The mines are rising through the permafrost as it thaws. So, in a way, this is a climate story. Please make a note of that in your quest log. |
| `pa_23` | If you find an ice core with a mine frozen inside it, do not sweep it. Bring it to me. That is not a hazard. That is a publication. |
| `pa_24` | Field notes, day 4,012. The Sweeper is still here. The mines are fewer. The coffee is frozen solid. Morale is excellent. |

### [Cmdr. Reyes](../characters/reyes.md)

| Id | Line |
|---|---|
| `ra_start` | Sweeper, Overlord. Station Nord-7. Minus 40 degrees. The mines are frozen, and so is my coffee. Follow the marker. |
| `ra_1` | If your fingers freeze, Sweeper, click with your elbow. Command does not care how the tiles get clicked. |
| `ra_2` | Polar bears in the area, Sweeper. They are not hostile. They are, however, extremely curious about flags. |
| `ra_win2` | Arctic sector cleared. Outstanding. Get warm, Sweeper. Not too warm, though. Your next stop is 300 meters underwater. *(victory)* |
| `r_win2` | Field clear. That's another one for the history books. Small history books. Pamphlets. *(second victory line, on the results screen)* |

**Unused:** `ra_win` ("Arctic sector cleared. Outstanding. Get warm, Sweeper. The next stop is classified. It's your mother's house.") is the victory line from before Pathos-4 was inserted as chapter 5. It is still baked and in the manifest, but nothing plays it; `ra_win2` replaced it.

### [Pvt. Jenkins](../characters/jenkins.md)

| Id | Line |
|---|---|
| `ja_1` | Sweeper, I licked a flagpole. Now I live here. |
| `ja_2` | My regenerating health is regenerating very slowly. I think it's frozen too. |

### [Dr. Mirela Kova](../characters/kova.md)

| Id | Line |
|---|---|
| `ka_1` | It's Mirela. The interface now has a heated version. It's warm, and slightly on fire. Fixing that in a patch. *(quest: Neural Interface Upgrade)* |

### [Big Dez](../characters/dez.md)

| Id | Line |
|---|---|
| `da_1` | Sweeper, it's Dez. It's minus forty where you are? Perfect. I'm opening the club's ice bar. You're the ice. *(quest: Get Yo Ass In Da Club)* |

### [Mom](../characters/mom.md)

| Id | Line |
|---|---|
| `ma_1` | Honey, I knitted you a scarf. It's on its way. It's very long. You can use it to mark the mines. *(quest: Call Your Mother)* |

### [Quartermaster Pryce](../characters/quartermaster-pryce.md)

| Id | Line |
|---|---|
| `qa_1` | Quartermaster here. Insulated flags in stock. They will never freeze. Unlike your bank account after buying them. *(quest: Premium Flag Collector)* |

### [??? (the whisper)](../characters/whisper.md)

| Id | Line |
|---|---|
| `wa_1` | In the cold, everything slows down, Sweeper. Even your heartbeat. Even the mines. Not your mother's calls, though. *(quest: Whispers in the Field)* |
