# Study UI readability — 2026-10-25

Implements the first approved audit priorities: explicit insertion answers, an optional compact laptop workspace, and execution feedback beside the editor.

- Completed reference `insertion_index` frames mark the actual insertion slot, not the last mid. A translated caption explains the returned index. Start/end/empty/duplicate examples and backward stepping are covered; other lessons and arbitrary user code receive no inferred answer marker.
- Focus mode hides the introduction temporarily and uses compact reference panels only at desktop widths. At 1280×720 the array, nine-line reference and controls fit together. Title/restore control remain accessible; normal Py placement/preferences are unchanged.
- Own-run status, initialization failures, stop messages and runtime errors sit inside the editor below Run. Partial replay, drafts and progress behavior are preserved. Completed code footers no longer say the state is before a line.

Verification:

- `npm run check`: 31 Python tests, 16 Node tests and TypeScript passed.
- `npm run build`: passed.
- `node tests/study-ui-browser.mjs`: passed; included in the existing browser CI suite. Tests cover answer positions/backtracking, viewport geometry, source visibility, 320/390 px overflow and editor-contained feedback using an actual blocked download.
- Full `test:browser`: passed, including all lessons/examples, EN/RU, Py, calendar, themes and mobile layouts.
- Full `test:solutions`: direct CDN run hit the existing 60-second initialization deadline. The 9,598,218-byte pinned WASM download also exceeded 45 seconds via curl. Downloaded the exact Pyodide 314.0.7 assets to a temporary local test cache and repeated the unmodified solution suite against those assets: passed. Python execution was real; the executor was not mocked. Product runtime delivery/deadlines are unchanged.
- Independent read-only review found no confirmed defects. Desktop/mobile screenshots inspected manually.

Previews: [compact desktop](../../media/study-focus-dark.png), [mobile answer](../../media/study-answer-mobile.png), [nearby execution feedback](../../media/study-feedback-mobile.png).

Later audit items remain separate: mobile scheme/code switching, richer numeric step explanations and long-comment presentation. Slow first-time CDN delivery remains an existing runtime limitation.
