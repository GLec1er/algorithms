# Bubble / Focus design verification · 2026-10-19

## Result

The approved Focus composition is implemented in the real Algorithms Lab application: floating rounded navigation, capsule controls, modal chapter catalogue, spacious lesson panels, updated Python editor, semantic scene colors, calendar and achievements. Light, dark and system appearances are available; the choice is stored separately as `patterns-theme`.

The project remains React/TypeScript/Vite without additional runtime dependencies. Palette and scene styles live in `src/styles/tokens.css` and `src/styles/scenes.css`. The application shell owns navigation/modal state; `App` retains routing, catalogue filters and progress. The existing progress calculation, curriculum, trace contracts, storage keys and deployment workflow were not modified.

Local production preview: `http://127.0.0.1:4174/algorithms/`. The public GitHub Pages site has not been updated. Verification was completed in the task checkout on `feat/study-calendar`, before any merge, push or PR. Git history records subsequent repository operations.

## Verification

- `npm run check`: 14 Python tests and 10 progress tests passed; TypeScript passed.
- `npm run build`: successful production build using the existing `/algorithms/` base path.
- `LAB_URL=http://127.0.0.1:4174/algorithms/ npm run test:browser`: passed against the production build. All 101 lessons × 4 examples reach the expected result.
- New browser checks: manual theme survives reload; system changes are applied; theme changes leave study progress untouched; storage denial preserves usable in-memory appearance and the existing progress warning.
- Catalogue: search, difficulty filtering, reset, route selection, Escape, explicit close and focus return work. Keyboard use inside the modal does not advance the player. Filters survive closing/reopening.
- Responsive checks cover 320, 390, 768, 1024 and 1440 CSS pixels in both themes; page, navigation, player and catalogue fit their containers. Existing 23 scene checks also pass at 320/390 px.
- A 720 CSS-pixel viewport at scale factor 2 was checked as the reflow equivalent of a 1440-pixel display at 200% zoom; page width remains 720 CSS pixels. This is not a separate real-device text-only zoom test.
- 23 scene families were captured and visually reviewed in light and dark appearances. The identified overlapping-state contrast issues were fixed and covered by real DOM contrast checks in both themes.
- Existing calendar checks pass: first-completion dates, repeat toggles without additional XP, weekday streak, month navigation, legacy migration, cross-tab synchronization and denied writes.
- `git diff --check`: passed. No changes in `src/progress.ts`, `src/types.ts`, curriculum, build scripts or GitHub workflow.

## Reproduced fixes

1. Moving the lesson guide initially placed it behind successful payload loading. A simulated HTTP 503 reproduced the missing explanation. A fallback guide now remains available during loading/error; retry recovers the player. The regression test failed before the change and passes afterward.
2. Active interval text color incorrectly affected the side label and merged result. The on-fill color now applies only to the active bar's internal label; result/side labels retain their semantic colors.
3. A graph node can be both focused and visited/colored. Visited fill previously overrode focus while the on-focus text remained. Focus fill now has precedence, keeping the value readable.
4. The queen in an active chessboard cell initially used the same purple as its background. Active cells and their coordinates now use the on-fill foreground.
5. The initial light purple with white text measured approximately 4.47:1. A small adjustment from `#7662e9` to `#735ee4` meets the 4.5:1 regression threshold used for the affected normal-sized labels.

## Review and implementation decisions

A separate read-only reviewer inspected the complete working changes and reproduced the graph/queen contrast defects in Chrome. No further code defects or deferred minor findings were reported. Fixes were verified by the regression checks and complete production browser suite.

- Reused the existing task-owned feature checkout instead of creating another worktree. Consequence: the implementation remains on the existing feature branch.
- Chapter headings expand their task list without navigating automatically. Consequence: selecting another chapter's first task requires a task click, and the modal remains open while browsing chapters.
- Scene styles were extracted into a focused stylesheet. Consequence: one additional stylesheet to maintain, with diagram geometry separate from application chrome.
- Visual styling was verified by screenshots/layout checks; behavioral changes received browser regression tests. Consequence: detailed visual parity remains a manual review responsibility.
- The slight light-purple adjustment favors text legibility over exact pixel matching to the concept.
- The preview follows the existing local-progress model. No accounts, submission judge, reminders, new XP rules or demo records were introduced.

## Boundaries

Verification used desktop Google Chrome with Playwright. Safari/iOS device testing was not available, so WebKit-specific material rendering remains unverified. Glass styling has an opaque fallback. The original 404-example calculations and final visual composition were checked by the implementing agent; the independent reviewer did not rerun all 404 examples or certify Safari/pixel-perfect parity.

Publication is intentionally pending the user's review of the local result.
