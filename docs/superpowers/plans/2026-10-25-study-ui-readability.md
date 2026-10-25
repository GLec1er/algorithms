# Study UI Readability Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. The user approved the audit recommendations in chat; no further design approval is needed for this scope.

**Goal:** Make the insertion answer unambiguous, fit the reference workspace on a laptop, and keep execution feedback beside the editor controls.
**Architecture:** Add an explicit optional insertion-position marker to ArrayRow, selected only by the insertion lesson's completed reference frame. Add a scoped compact reference layout, and relocate own-run status/errors into the editor without changing runtime/progress contracts.
**Tech Stack:** Existing React/TypeScript, CSS, RU/EN translations and Playwright regression suites.
**Spec:** User-approved UI audit, `outputs/ui-audit-2026-10-25/review.md` in this task's parent workspace. Initial scope is final-answer clarity, compact laptop layout and nearby execution feedback; mobile view switching and richer step explanations are separate follow-ups.

## Global Constraints

- Preserve actual traces, example selection, keyboard controls, themes, Py preferences, drafts and XP behavior.
- Reference insertion answer supports index 0 through array.length, including empty input.
- No inferred answer markers for arbitrary user code or other lessons.
- Keep translated status/error text and partial trace playback; do not duplicate alerts.

## Review Focus

- Completed frame followed by stepping backward must restore mid/range styling.
- End and empty insertion slots must fit on 320/390 px screens.
- Long code/scenes must remain scrollable in the compact reference workspace.
- Stop, initialization failure, stale source and runtime errors stay near run buttons.
- A keyboard user must retain controls and source context without automatic page jumps on every step.

## Tasks

- [x] Add failing browser regressions for final markers, backward stepping, compact workspace dimensions and editor-contained feedback.
- [x] Update `primitives.tsx`, `Scene.tsx`, `Code.tsx`, `App.tsx`, `OwnSolution.tsx`, translations and scoped study CSS. Compact styling applies at desktop widths; retain mobile stacking and Py visibility preferences.
- [x] Run check/build, targeted regressions, existing browser/solution suites; inspect desktop/mobile light/dark screenshots and request independent read-only review.
- [x] Save evidence, commit and push the reviewable change as a PR; leave main publication to the existing merge flow.
