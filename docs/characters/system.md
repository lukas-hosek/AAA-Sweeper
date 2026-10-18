# SYSTEM

| | |
|---|---|
| Speaker key | `sys` (batch-1 id prefix `s`) |
| Subtitle colour | `#8fd3ff`; not a radio voice (no radio chain, no transmission panel) |
| Voice | Kokoro `af_nova`, speed 0.95, clean |

## Personality

The game itself talking: the calm, neutral announcer of achievements, autosaves and level-ups that AAA games narrate over the action. It has no jokes of its own. The joke is how often it interrupts, and that the things it announces are trivial ("Objective updated." for following a marker). It is part of the "constant interruptions" layer (GAME_DESIGN.md §5).

## Lines

All of them are event barks, in every chapter unless noted.

| Id | When | Line |
|---|---|---|
| `s_quest` | A side quest is added | New quest available. |
| `s_ach` | Achievement unlocked | Achievement unlocked. |
| `s_save` | The fake autosave | Autosave complete. |
| `s_crit` | Health below 40 | Warning. Health critical. |
| `s_level` | Level up | Level up. |
| `s_season` | After a level up | Season pass progress updated. |
| `s_skill` | Unspent skill points (nag) | You have unspent skill points. |
| `s_drop` | Supply drop lands | Supply drop incoming. |
| `s_obj` | Quest marker followed | Objective updated. |
| `s_chal` | Daily challenge complete | Daily challenge complete. |
| `s_store` | After some Quartermaster lines, with the store toast | New items available in the store. |
| `s_check` | Respawn after death | Checkpoint reached. |
| `s_breach` | [Pathos-4](../levels/5-pathos-4.md), 12 s into the countdown | Warning. Hull breach detected. |
| `s_flood` | [Pathos-4](../levels/5-pathos-4.md), 30 s left | Flooding imminent. |
