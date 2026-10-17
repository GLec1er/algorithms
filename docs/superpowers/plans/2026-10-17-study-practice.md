# Study Practice Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution. User preferences restrict unrequested subagents.

**Goal:** Ship a weekday practice calendar, meaningful rewards, 404 varied examples and detailed guides for 19 patterns.
**Architecture:** Pure TypeScript progress/date model, versioned local persistence, React calendar and guide components, build-time Python curriculum enrichment.
**Tech Stack:** Existing React, TypeScript, Vite, Python, Node test runner and Playwright; no new dependencies.
**Spec:** `docs/superpowers/specs/2026-10-17-study-practice-design.md`.

## Global Constraints

New tasks only close the weekday goal. No invented historical dates. At least four distinct examples per lesson. Preserve current style, traces, hash routes and storage-denied recovery.

## Review Focus

- Browser-local day boundaries, month/year/leap-day transitions and weekends.
- Legacy or corrupted storage and old completed tasks without dates.
- Repeated mark/unmark actions and switching lessons during playback.
- Calendar before tracking starts, today still pending and all tasks completed.
- Added examples with nonunique outputs, empty/minimal inputs and bounded traces.

### Task 1: Progress model and migration

**Files:** `src/progress.ts`, `tests/progress.test.mjs`, `package.json`.
**Interface:** StudyProgress v2; parseProgress, toggleLesson, localDay, shiftDay, dayStatus and practiceStats, consumed by Task 3.

- [ ] Write tests for weekday success, weekend bridging, pending today, missed weekday reset, duplicate toggles, legacy migration, malformed input, leap dates, XP/badges.
- [ ] Run Node tests; expect missing module/API failure.
- [ ] Implement the pure model and validation; run Node tests plus existing Python suite; expect all green.
- [ ] Commit model and tests.

### Task 2: Curriculum enrichment

**Files:** `curriculum/extra_examples.py`, `curriculum/patterns.py`, `curriculum/catalog.py`, `scripts/build_lessons.py`, `tests/test_curriculum.py`.
**Interface:** Every lesson has >=4 distinct labelled examples; every chapter has a guide. Catalog stats expose the actual example count for Task 3 and tests.

- [ ] Write contract tests for four unique inputs and complete guides; expect current two-example curriculum to fail.
- [ ] Add two independently specified examples per lesson and original explanations for all patterns.
- [ ] Compile and run full Python checks; expect >=404 correct bounded examples.
- [ ] Commit content and checks.

### Task 3: Calendar, rewards and guides UI

**Files:** `src/components/PracticeCalendar.tsx`, `src/components/PatternGuide.tsx`, `src/App.tsx`, `src/types.ts`, `src/styles.css`, `tests/browser.mjs`.
**Interface:** Consumes StudyProgress and enriched chapter guides. Route `#/calendar`; first-completion history and legacy flags share one authoritative persistence record.

- [ ] Add browser scenarios for calendar navigation, first-day reward, no reward on repeat, legacy undated progress, detailed guides and all available example options; verify missing UI fails.
- [ ] Implement calendar/month/day views, weekday goal, XP/levels/achievements, sidebar shortcut, state migration and guide rendering.
- [ ] Run check/build/full browser suite including 320/390 px calendar and lesson views; inspect screenshots.
- [ ] Commit UI and checks.

### Task 4: Review and publish

- [ ] Review diff against the five review risks and record evidence; preserve existing user changes.
- [ ] Publish through existing main/Pages workflow; verify successful deployment and public calendar/example loading.
- [ ] Refresh source archive, screenshots and verification report in outputs; report browser-local storage limitation.

## Execution ledger

- Pre-flight: Task 1 produces progress APIs used by Task 3; Task 2 produces chapter guides and variable example counts used by Task 3. Interfaces aligned; existing lesson payload format is unchanged.
- Execution: inline, following persistent user preference for no unsolicited subagents. Existing task-specific clean clone is isolated; branch starts at cb3f385.
- User confirmed: only a new task counts toward a daily goal.

- Task 1: complete — missing progress module reproduced RED; 9 Node tests GREEN; existing 13 Python tests and TypeScript pass. Legacy dates remain null; first-completion history persists through repeat marks.

- Task 2: complete — 120 missing-content contract failures RED; 404 independently specified examples compile into 14,813 states; 14 Python tests, 9 progress tests and TypeScript GREEN. All 19 guides include a worked example.
