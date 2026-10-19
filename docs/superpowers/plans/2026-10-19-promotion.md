# English-first Algorithms Lab Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. Steps use checkboxes.

**Goal:** Ship the approved bilingual promotion-ready learning experience.
**Architecture:** Stable curriculum IDs with validated English/Russian text, shared execution traces, a locale context, and local-only progress backups. Preserve React/Vite/Python and existing routes/storage.
**Tech Stack:** React, TypeScript, Vite, Python stdlib, Node tests, Playwright.
**Spec:** docs/superpowers/specs/2026-10-19-promotion.md

## Global Constraints
- English first; complete optional Russian; preserve progress, example and frame on switch.
- 19 chapters, 101 lessons, 404 verified examples; static deployment.
- No external translation, backend, analytics or new production dependencies.
- Work on a separate branch; prepare a reviewable PR, do not merge/deploy.

## Review Focus
- Invalid locale values and unavailable browser storage must not crash or lose state.
- Unknown lesson IDs, invalid/future dates and conflicting backup records must be rejected before replacement.
- Deep links, hash navigation and explicit language links must survive reloads.
- Long translations must fit mobile navigation and retain accessible names.
- Translation changes must never change source line numbers or trace semantics.

### Task 1: Locale and bilingual curriculum
Files: src/i18n.tsx, src/locale.ts, curriculum/english.py, scripts/build_lessons.py, curriculum/runtime.py, tests/locale.test.mjs, tests/test_localization.py.
Interfaces: resolveLocale(search, saved) => 'en'|'ru'; useLocale() => {locale,setLocale,t}; localize curriculum with stable IDs.
- [x] Add and run failing locale precedence/coverage/trace tests.
- [x] Implement validated bilingual data and locale selection; translate all 101 lessons and 19 guides.
- [x] Verify Node/Python tests, compiler, types; commit.

### Task 2: Bilingual interface and home
Files: src/App.tsx, src/components/*, src/Home.tsx, src/styles.css, index.html, tests/promotion-browser.mjs.
Interfaces: locale context consumed by all views; home '#/'; existing lesson/calendar routes preserved.
- [x] Add and run failing browser checks for English first visit, explicit Russian, frame/progress preservation, and sharing.
- [x] Translate all UI/scenes, add pattern overview/home/resume and locale-aware share links.
- [x] Verify both languages, legacy routes and mobile rendering; commit.

### Task 3: Progress backups
Files: src/backup.ts, src/components/ProgressBackup.tsx, src/components/PracticeCalendar.tsx, tests/backup.test.mjs.
Interfaces: exportBackup(progress, ids), parseBackup(text, ids, today) => validated StudyProgress; component onRestore callback.
- [x] Add and run failing round-trip, invalid-date, unknown-ID, conflicting-record tests.
- [x] Implement local download, validation preview, cancellation, replacement and prior-state backup.
- [x] Verify invalid imports leave state unchanged and existing progress tests pass; commit.

### Task 4: Public presentation and final verification
Files: README.md, README.ru.md, CONTRIBUTING.md, .github templates, public social assets, index.html, browser tests/workflow.
- [x] Write English docs and linked Russian README; capture real UI demo assets; add metadata and contribution entry points.
- [x] Run npm run check, npm run build, npm run test:browser; inspect real desktop/mobile screenshots in both languages.
- [x] Review final diff, correct demonstrated problems, record evidence; commit and open draft PR.
