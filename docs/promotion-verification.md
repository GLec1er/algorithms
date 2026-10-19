# English-first release verification

Verified on 2026-10-19 against the feature branch based on `a1cf864`.

## Result

English is the default first-visit language. Russian remains available across the curriculum, player, discovery, calendar and local backups. Existing lesson IDs, deep links and progress keys remain compatible.

## Checks performed

- `npm run check`: 17 Python tests and 16 Node tests passed; TypeScript passed.
- `npm run build`: 19 chapters, 101 lessons, 404 checked examples and 14,813 recorded Python states; production build passed.
- `LAB_URL=http://127.0.0.1:4187/algorithms/ npm run test:browser`: passed against the production preview.
- English browser checks visit all 101 lessons, open pattern guides, replay every example to its expected answer and check displayed English content for untranslated Cyrillic text.
- Russian browser checks visit all 101 lessons and examples, plus playback/keyboard, calendar, progress migration, unavailable storage, themes, modal focus, invalid routes and 23 representative scenes at desktop, 320 px and 390 px.
- New browser checks cover language selection and reload, preserving example/frame/completion on switch, shared-link clipboard content, bilingual search, resume, mobile home/player/calendar, 200% CSS zoom on home, backup rejection/preview/cancellation/replacement, exporting and downloading the prior state before restore.
- Python AST comparison against the base confirms all 19 solution modules are semantically unchanged; only comments were translated. The Russian palindrome statement now accurately says non-alphanumeric characters.
- Issue-template YAML parsed successfully with Ruby's YAML parser. The social image is 1200×630; the demo GIF contains 17 actual 1200×800 UI frames.
- Actual desktop and EN/RU mobile screenshots were inspected. `git diff --check` passed.

## Review and decisions

Self-review covered translation coverage, trace/source correspondence, language precedence, navigation, local history validation, metadata and documentation. No subagents were used, following the user's workspace preference. This is an author review rather than an independent review.

Implementation decisions: use an isolated clone to protect the existing other-chat checkout; execute the approved plan inline; integrate calendar restoration with its backup component in one feature commit. No new production dependencies were introduced.

## Limits

Browser automation ran in Chrome on this host; CI runs the same suite with Chromium. This does not establish coverage of every browser or every possible input. The site replays prepared examples and does not execute arbitrary Python. Hash-route pages share the static social metadata. The GitHub custom social preview image can optionally be set from `public/social-preview.png`; the website's Open Graph metadata already references it.

Merging and live deployment are separate from this prepared release. No promotion posts were sent and no star count is guaranteed.

## Design refinement

The home page now puts a real, manually started binary-search trace next to concise copy. Generic three-step marketing cards were removed; the pattern library uses compact rows. Language and theme choices use styled native-radio groups with visible selected/focus states and icon hints. The narrow header fits two compact rows.

`tests/design-polish-browser.mjs` exercises keyboard theme selection and persistence, stepping/playing/resetting the demo, its independently known result (index 1 for target 2 in [1,3,5,6]), language changes without resetting the current demo frame, no study-credit writes from the demo, failed loading, and first-screen array/playback visibility at 320, 390, 635, 768, 1024 and 1440 px in both languages. These checks join the existing full browser suite.
