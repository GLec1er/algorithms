# Algorithms Lab: English-first promotion readiness

Date: 2026-10-19
Status: approved by the user on 2026-10-19; implemented on the feature branch.

## Intent

Make Algorithms Lab useful and immediately understandable to developers preparing for coding interviews. The immediate distribution goal is to earn the first 16 genuine GitHub stars through a useful public project. No star count or timeline is guaranteed.

The user requested substantial improvements before promotion, with English as the primary language and Russian available as an option. Preserve the existing visual direction and working algorithm visualizations.

## Verified starting point

- Public repository: https://github.com/GLec1er/algorithms
- Live demo: https://glec1er.github.io/algorithms/
- Main branch inspected: `a1cf86413b268e1bc761037d559351a34e3ca71c`.
- The existing clean local checkout is on `feat/study-calendar`, at its merged commit `8c6918a`. Its files will not be reset or repurposed.
- React, TypeScript and Vite frontend; Python standard-library curriculum compiler; static GitHub Pages deployment.
- 19 chapters, 101 lessons and 404 prepared examples. The compiler runs Python and verifies expected answers during the build; the browser replays recorded execution states.
- New visitors currently enter a single lesson. The interface, teaching explanations, generated step messages, dates and accessibility labels use Russian.
- GitHub description and topics are empty. The current README is Russian and has no opening demonstration image.
- Existing checks include Python curriculum/tracer/property tests, Node progress tests, TypeScript checks and Playwright browser checks.

## Product decisions

These implementation choices are proposed defaults, not additional user requirements.

### 1. Complete English and Russian experiences

English is the default for a first visit, including visits from a Russian-language browser. A clearly labelled `English / Русский` selector is available on desktop and mobile.

Language selection order: a valid explicit `lang=en` or `lang=ru` URL query parameter, then a saved explicit preference, otherwise English. Invalid values safely use the default. Selection updates the document language, page title, description, calendar formatting and shareable URL. Switching language preserves the current lesson, example, animation position and progress.

Translate all user-facing material: navigation, accessible names, status and error messages, filters, scene labels, complexity qualifiers, 101 lesson statements and explanations, 19 pattern guides and worked examples, example names, trace explanations, calendar, achievements and progress notices. Russian remains complete. Displayed Python identifiers and executable behavior remain stable; explanatory comments shown to users should be English.

Use explicit, reviewable translation data with stable IDs. No runtime machine translation, external translation service or silent fallback to Russian in the English experience. Compilation fails if required curriculum translations are missing or mismatched. Reuse trace data instead of duplicating Python execution for each language where practical.

### 2. A useful first visit

Introduce a real home route at `#/` and make the brand link lead there. Explain the value in one sentence: explore coding interview patterns through Python execution visualizations.

The first screen offers a working example, a browse-patterns action and, for returning users, a resume action. Surface the verified curriculum counts and a small selection of representative lessons. Include a browsable/searchable overview of the 19 patterns so visitors can understand the coverage without opening a hidden drawer.

Keep the existing player and calendar routes, deep links, themes and responsive visual direction. Preserve existing saved progress and the last studied lesson. Do not unexpectedly redirect returning users away from an explicit deep link.

### 3. Clear learning and sharing

Make the execution model visible in concise help: prepared examples, recorded Python states, highlighted state before the next line. Avoid implying arbitrary Python execution or custom inputs.

Provide an accessible way to copy a link to the current lesson and language, with clear success/failure feedback. Keep playback controls, keyboard shortcuts, examples, code and pattern explanations easy to find. Ensure English text fits at narrow mobile widths and 200% zoom.

Audit lesson statements and explanations against the actual implementations and examples. Correct demonstrated ambiguities and defects; add independent expected-result checks for any changed algorithm behavior. Avoid cosmetic rewrites of working algorithms.

### 4. Preserve the learner's work

Add a small progress backup workflow: export the existing study data to a local JSON file, inspect a validated import summary and explicitly confirm replacing current progress. Offer a way to cancel before replacement and preserve a downloadable backup of existing progress. Reject malformed, incompatible or unknown lesson data without changing current progress. Export/import operates locally and does not upload user data.

Maintain existing first-completion dates, XP and streak rules, undated legacy completions and unavailable-storage behavior. Language changes never migrate, reset or duplicate study history.

### 5. Public repository presentation

Write the primary README in English, with a Russian README linked near the top. Lead with the benefit, a prominent live demo link, a real screenshot/short animation and three concrete capabilities. Include quick start, tested commands, execution limits, keyboard controls, progress storage, curriculum scope, attribution and MIT licensing.

Add a concise English contribution guide, useful bug/feature issue templates and a pull request template. Explain how to add or correct a lesson, provide translations and run the relevant checks. Keep entry points lightweight.

Prepare a social preview image from the actual interface and English Open Graph metadata, a canonical homepage URL and a meaningful page description. Do not promise rich previews or search indexing for individual hash routes; GitHub Pages serves a shared HTML document.

Proposed GitHub description:

> Interactive coding interview patterns: 101 Python problems, step-by-step visualizations, and English/Russian explanations.

Proposed topics: `algorithms`, `data-structures`, `algorithm-visualization`, `python`, `coding-interview`, `interview-preparation`, `react`, `typescript`, `education`.

### 6. Quality and delivery

Reuse the current architecture and dependencies. Work in an isolated checkout or worktree based on current `main`, protecting the existing checkout and any later user edits. Use an implementation branch and a reviewable pull request.

Do not publish promotional messages, request stars from other users, purchase anything, add analytics or introduce a backend as part of this work. Prepare deployment-ready changes and review evidence. Merging and live deployment can be a final explicit user decision after review.

## Acceptance criteria

1. A fresh visit opens an English home page with a clear demo/browse path; an explicit Russian selection works and persists.
2. Both locales cover every lesson, pattern guide, scene and practice screen. Missing translation checks fail deterministically.
3. Switching locale preserves lesson, example, current frame and all saved progress. Share links restore their explicit language.
4. All 404 prepared examples still compile and finish with the independently specified expected result; trace/source line correspondence remains valid.
5. Existing progress and calendar checks remain valid; local backup round-trips work, and invalid imports leave progress unchanged.
6. No broken deep links, uncaught page errors or unintended page-wide horizontal overflow in the home, catalog, player and calendar at 320 px, 390 px and desktop widths in both languages.
7. Keyboard navigation, visible focus, modal focus management, reduced motion and relevant accessible labels work in both languages.
8. Python/Node tests, TypeScript, production build and the expanded Playwright suite pass. Browser evidence includes real desktop/mobile captures and an English demo asset.
9. README commands and links match the final implementation; curriculum counts and feature claims are verified from the generated build.
10. A final review reports changes, validation, remaining limitations and the pull request or local diff. Public deployment and promotion are identified separately.

## Implementation sequence

1. Establish isolated source state and record baseline checks.
2. Introduce the locale model and complete curriculum translations, with coverage checks.
3. Localize all screens and trace explanations while preserving player/progress state.
4. Add the home/pattern overview, resume and lesson-sharing flows.
5. Implement validated local progress backups.
6. Improve repository documentation, metadata and real demo assets.
7. Run full checks, inspect desktop/mobile rendering, fix demonstrated issues and review the final diff.

## Deliberate limits

This release does not add arbitrary Python execution, custom inputs, accounts, cloud sync, payments, AI tutoring or a different algorithm curriculum. These would materially change the product and delay a useful promotion-ready release. English and Russian are the supported languages.
