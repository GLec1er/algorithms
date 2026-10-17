# Practice release verification · 2026-10-17

## Delivered

- A browser-local calendar at `#/calendar`, requiring at least one newly solved task each weekday, with optional weekends.
- First-completion history, 100 XP per unique task, levels every 500 XP, weekday streaks and four achievement goals.
- Legacy marks migrate without fabricated dates. Repeating or unmarking a task preserves its first-completion history and awards no additional XP.
- Obligations stop once all 101 tasks have been solved. Pending today does not prematurely break an existing streak; weekends neither extend nor break it.
- Four distinct examples for each of 101 lessons: 404 independent expected answers, compiled to 14,813 bounded Python states.
- Detailed original explanations and worked walkthroughs for all 19 patterns, displayed in collapsible lesson guides.

## Checks

- `npm run check`: 14 Python tests and 10 pure progress-model tests pass, followed by TypeScript.
- `npm run build`: successful production build under the existing `/algorithms/` base path.
- `npm run test:browser`: all 404 examples reach their checked terminal result; calendar routes, Monday/Tuesday tracking, persistence/reload, no repeat XP, legacy migration, cross-tab updates and storage failure recovery pass.
- Mobile checks cover calendar and all 19 guide families at 320 and 390 px; existing scene/player/keyboard/search/route checks remain green.
- Screenshots reviewed for desktop/mobile calendar, the existing player and an expanded guide. Mobile full-page capture uses a fresh page after viewport changes to avoid a browser capture artifact.

## Reproduced fixes

The initial model lacked a course-completion boundary: an added failing test showed that a finished curriculum would continue imposing goals. The model now stops obligations and preserves the final streak; that test passes.

A storage fault test allowed reads but rejected writes. A second new task incorrectly reloaded stale persisted history: 200 XP instead of 300. When persistence is unavailable, toggles now use current in-memory progress. The test failed before the fix and passes with the complete suite afterward.

## Review and boundaries

Author review covered date/month/leap boundaries, undated legacy progress, repeated toggles, storage failures, cross-tab updates, prepared-example contracts and finite curriculum completion. No independent reviewer is claimed, following the user's restriction on unsolicited subagents.

Progress remains local to this browser, with no account or server sync. Clearing browser storage removes it. The calendar tracks self-reported first completion, not automatically judged submissions. No reminders or external calendar events were created.
