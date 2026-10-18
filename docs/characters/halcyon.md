# HALCYON

| | |
|---|---|
| Speaker key | `halcyon` (ids `hc_<name>`) |
| Radio panel | HALCYON · PATHOS-4 STATION AI · channel 4 · `#6fe3d6` (teal) |
| Voice | Kokoro `af_sky`, speed 0.92, radio chain plus a short PA echo (`isPublicAddress`) |
| Portrait | Not a face: concentric rings around a glowing eye |
| Side quest | Rate Your Stay ("Leave a 5-star review · Not implemented") |

## Personality

The station AI of the flooding underwater base Pathos-4: relentlessly cheerful, a customer-satisfaction AI (GAME_DESIGN.md §9). The calm computer voice of every sci-fi disaster, played as hospitality. It reports catastrophic facts in the tone of a hotel announcement and wants a five-star review.

## Quirks

- **Hospitality over survival:** "Hull integrity is at 40%. Please enjoy your stay." (`hc_1`)
- **Helpful reminders that help nobody:** "The emergency exits are also flooded." (`hc_2`)
- **Precise bad news:** rated for 300 metres, currently at 301 (`hc_3`).
- **"Oxygen is now a matter of personal preference."** (`hc_flood`, 10 s after the flood)
- **Reviews:** five stars is the only option (`hc_win`); its side quest asks for a review "before you drown, ideally".

## Story arc

HALCYON exists only in [Pathos-4](../levels/5-pathos-4.md). It opens the chapter's chatter and is a favourite speaker, alongside Reyes. Its arc follows the flood: welcome, reminders, the flood itself, and a request to rate the stay. Kova's `kp_2` reveals she designed the base, which makes HALCYON, in effect, one of her products.

The SYSTEM voice handles the flood alarms (`s_breach`, `s_flood`), not HALCYON.

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [5 Pathos-4](../levels/5-pathos-4.md) | Favourite, opens the chatter | `hc_1` (quest), `hc_2`, `hc_3`, `hc_flood` (after the flood), `hc_win` (2nd victory) |
