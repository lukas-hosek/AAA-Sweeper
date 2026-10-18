# Cmdr. Reyes, "Overlord"

| | |
|---|---|
| Speaker key | `reyes` (batch-1 id prefix `r`) |
| Radio panel | Cmdr. Reyes · OVERLORD · channel 2 · `#f4b740` (gold) |
| Voice | Kokoro `am_onyx`, speed 1.0, radio chain |
| Portrait | Soldier's helmet with a headset microphone |
| Concept-art note | "gruff but fair" |

## Personality

The commanding officer on the other end of the radio, and the voice of the AAA military shooter. Gruff, urgent, completely sincere. He briefs every field like a decisive battle and then tells the Sweeper to click the glowing tile.

- He states the obvious with gravity: "Intel says this field is full of mines. That's why they call it a minefield."
- He undercuts himself mid-line, usually in the third sentence: "Small history books. Pamphlets." / "Which means I have no idea what I'm talking about."
- He speaks for "Command", an institution that is flexible about deadlines, doesn't care how tiles get clicked, believes in you, and is on dry land.

## Quirks

- **Overlord:** his call sign; every chapter briefing opens "Sweeper, Overlord."
- **The marker:** he can't understand why the Sweeper would ever do anything but follow it (`r_copy`, `r_idle`, `r_hit3`).
- **Health regeneration as doctrine:** "Your body can heal from anything." (`r_hit2`), "Drink water... It does, actually. But drink water." (`rd_2`).
- **Frozen coffee** at Station Nord-7 (`ra_start`), which Lindqvist later echoes in her field notes (`pa_24`).

## Story arc

Reyes is the campaign's spine: he gives the orders for chapters 1, 2 and 5 and hands the Sweeper from one chapter to the next in his victory lines.

1. **Sector B-4:** the hard-boiled opening ("nobody else has to die") and the promise of "forty more" fields.
2. **The Dune Sea:** the briefing starts to fray ("I have no idea what I'm talking about"); he sends the Sweeper "somewhere with a dress code".
3. **Da Club:** out of his depth. Is this a mission or a night out? "Also, what's this song?"
4. **Station Nord-7:** a supporting role to Lindqvist; points the Sweeper 300 metres under water.
5. **Pathos-4:** the dramatic voice of the flood: the 30-second warning, then "Command believes in you. Command is on dry land." Sends the Sweeper home.
6. **Mom's Backyard:** asks the Sweeper to treat Mom's garden "like any other warzone. With respect." Command accepts a casserole; morale is very high.

He is also the voice of every mine hit, flag, big reveal, idle nag, the halfway mark and the death screen, in every chapter.

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [1 Sector B-4](../levels/1-sector-b4.md) | Quest giver | `r_start` (opening), `r_copy`, `r_intel`, `r_push`, `r_win` (victory) |
| [2 The Dune Sea](../levels/2-dune-sea.md) | Quest giver, favourite | `rd_start` (opening), `rd_1`, `rd_2`, `rd_3`, `rd_win` (victory), `r_win2` (2nd victory) |
| [3 Da Club](../levels/3-da-club.md) | Caller | `rc_1`, `rc_2` |
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Chapter opening | `ra_start` (opening), `ra_1`, `ra_2`, `ra_win2` (victory), `r_win2` (2nd victory) |
| [5 Pathos-4](../levels/5-pathos-4.md) | Quest giver, favourite | `rp_start` (opening), `rp_1`, `rp_2` (30 s warning), `rp_flood` (flood), `rp_3` (after the flood), `rp_win` (victory) |
| [6 Mom's Backyard](../levels/6-moms-backyard.md) | Caller | `rh_1` (opens the chatter), `rh_2` |

He hands out no side quest.

### Event barks (any chapter)

| Id | When | Line |
|---|---|---|
| `r_hit1` | Mine hit (random pick) | Sweeper's hit! Get to cover and let your health regenerate! |
| `r_hit2` | Mine hit | Take cover! Just stand still for a bit. Your body can heal from anything. |
| `r_hit3` | Mine hit | Was that a mine? Sweeper, the marker was literally right next to it. |
| `r_hit4` | Mine hit | Contact! You stepped on a mine! Walk it off, Sweeper! |
| `r_hit5` | Mine hit | That's going to leave a mark. Several marks, actually. Mostly crater. |
| `r_flag` | First flag, then sometimes | Mine marked. Good eye, Sweeper. |
| `r_flag2` | Flag | Flag planted. Command will be very impressed. Or mildly impressed. |
| `r_flag3` | Flag | Good flag. Real good flag. Textbook flag. |
| `r_area` | 20+ tiles in one click | Good effect on target! Area cleared! |
| `r_area2` | 20+ tiles in one click | Huge area cleared! That's what I call a sweep! |
| `r_idle` | Idle for 13 s | Sweeper, why have you stopped? The marker is right there. It's glowing. |
| `r_idle2` | Idle for 13 s | Sweeper, you've been staring at that grid for a while. Blink twice if you need help. |
| `r_half` | Half the safe tiles open | You're halfway there, Sweeper. I've seen men give up at halfway. Don't be those men. |
| `r_dead` | Death | Sweeper's down! Sweeper's down! Somebody reload the checkpoint! |
| `r_lore` | Lore fragment found | Is that a collectible? Sweeper, we do not have time for collectibles. Pick it up anyway. |

Jenkins shares the hit, area, idle and lore pools (`j_hit`, `j_area`, `j_idle`, `j_lore`).

### Shared pool (any chapter, after its arcs)

| Id | Line |
|---|---|
| `rg_1` | Sweeper, your performance review is next week. Topics include clicking, flagging, and your attitude towards Big Dez. |
| `rg_2` | Remember, Sweeper. Every tile you clear today is a tile you don't have to clear tomorrow. Unless there's a sequel. |

Repeatable (`REPEATABLE_LINES`): `r_copy`, `r_push`, `r_intel`, `rd_1`, `rg_2`.

### Unused

`ra_win`, the old arctic victory line that sends the Sweeper straight to Mom's house; it predates Pathos-4 and nothing plays it (see [Station Nord-7](../levels/4-station-nord-7.md)).
