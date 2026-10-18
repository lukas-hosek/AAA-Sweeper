# Quartermaster Pryce

| | |
|---|---|
| Speaker key | `qm` (batch-1 id prefix `q`) |
| Radio panel | Quartermaster Pryce · SUPPLY · channel 4 · `#4fd8ff` (cyan) |
| Voice | Kokoro `bm_george` (British), speed 1.05, radio chain |
| Portrait | Peaked cap and a moustache |
| Concept-art note | "sells flags" |
| Side quest | Premium Flag Collector ("Own premium flags (n/3)", button OPEN STORE) |

## Personality

The supply officer, recast as the in-game store. Polite, British, a little weary, and always selling flags. He is the battle pass and the microtransaction storefront speaking on the radio. Every pitch is honest about how pointless the product is.

## Quirks

- **"Quartermaster here."** Almost every call starts with it.
- **Products that admit they are useless:** sand-proof flags ("Regular flags are also sand-proof. But these ones say so.", `qd_1`), desert camouflage you lose against the sand (`qd_2`), waterproof flags that float, "which makes them terrible flags" (`qp_1`).
- **Prices:** auto-flag bundle 12.99 (`q_3`), five flags, a hat and a sense of purpose for 49.99 (`qg_1`), insulated flags that freeze your bank account (`qa_1`).
- **Store nag:** after any of his lines there is a 50 % chance of a "LIMITED TIME OFFER" toast ("Premium flag skins are in the store. Press B.") and the SYSTEM line `s_store`.

## Story arc

No arc as such: he is a recurring commercial break. Each chapter brings a themed flag (sand-proof, glow-in-the-dark "behind the bar, cash only", insulated, waterproof, garden gnome "It judges you silently"). His Sector B-4 introduction (`q_1`) names the real store items: the Golden, Chrome and Musical flags.

## Appearances

| Chapter | Role | Lines (full text in the level file) |
|---|---|---|
| [1 Sector B-4](../levels/1-sector-b4.md) | Caller | `q_1` (quest), `q_2`, `q_3`, `q_4` |
| [2 The Dune Sea](../levels/2-dune-sea.md) | Caller | `qd_1` (quest), `qd_2` |
| [3 Da Club](../levels/3-da-club.md) | Caller | `qc_1` (quest) |
| [4 Station Nord-7](../levels/4-station-nord-7.md) | Caller | `qa_1` (quest) |
| [5 Pathos-4](../levels/5-pathos-4.md) | Caller | `qp_1` (quest) |
| [6 Mom's Backyard](../levels/6-moms-backyard.md) | Caller | `qh_1` (quest) |

### Shared pool

| Id | Line |
|---|---|
| `qg_1` | Bundle alert, Sweeper. Five flags, a hat, and a sense of purpose. 49.99. |

Repeatable: `q_2`, `q_3`, `q_4`, `qd_2`.
