# Reference copies (read-only)

- **`triple-a-sweeper-v11.html`**: the last published single-file version before the split into modules (artifact version 11, 6.2 MB, voices embedded). Open it directly in a browser. Use it to check whether a behaviour is a regression from the split or was always like that.

- **`history/`**: the single-file *source template* (the code without the embedded voices) at each milestone. The voice data placeholder `/*__VOICES__*/{}` is empty, so these files are for reading and diffing, not playing.

| File | State |
|---|---|
| `template_v1.html` | The first full game: Sector B-4 only, 50 voiced lines, "Tripple-A" spelling, radio chatter defaulting to Constant |
| `template_v2.html` | Chapters 2–5 (Dune Sea, Da Club, Nord-7, Mom's Backyard) with their own scenery, sandstone and dance-floor tilesets, desert and club music, blood overlay, 100 more lines, calmer chatter default, renamed "Triple A" |
| `template_v3.html` | End credits (1,412 × Claude) with concept-art showcase |
| `template_v4.html` | Arctic and home music themes, ice and lawn tilesets |
| `template_v5.html` | Pathos-4 (flood, breath meter, HALCYON, bulkhead tileset, Lydian theme), klaxon removed |
| `template_v6.html` | Asymptotic breath meter |
| `template_v7_final.html` | Large breath readout, slower decay, 20 more Prof. Lindqvist lines: the source of the module split |

Diff two milestones to see exactly what a feature changed, e.g. `diff <(tr ';' '\n' < template_v4.html) <(tr ';' '\n' < template_v5.html)`.
