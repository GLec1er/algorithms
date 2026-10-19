# Py clarity and placement implementation plan

> Execute inline with executing-plans. No delegation: the user's standing instructions require explicit permission for subagents.

**Goal:** Fix the user's screenshot defects while keeping the approved robot-python design.
**Architecture:** Keep the shared optional PyMascot and native WebGL renderer. Use heading stages for the lesson and calendar, full Retina backing resolution and mipmapped minification. Fix catalog geometry at the source.
**Tech stack:** React, TypeScript, CSS, WebGL 1, existing Playwright suite.
**Spec:** User's October 19 screenshots and request; existing technical-studio-py spec remains applicable.

## Constraints and review focus
- English first, optional Russian; preserve completion history and existing controls.
- Honor hide/motion/reduced-motion preferences on all three routes.
- One mascot per route; heading layout must collapse when hidden.
- Check long titles and both languages at 320/390/768/1440 CSS px.
- Check Retina 2x/3x, static fallback, context loss and late import cancellation.

## Task 1: Rendering and placement
- [x] Add tests/py-clarity-browser.mjs and observe five real failures on the merged build.
- [x] Modify renderer.ts: full Retina resolution with bounded 2x–4x supersampling and high-precision texture coordinates, high-quality prefiltering to the visible physical size, premultiplied alpha for clean transparent edges. Visual comparison rejected trilinear mipmaps because they softened details compared with the static image.
- [x] Modify PyMascot.tsx: calendar variant and correct intrinsic aspect ratio.
- [x] Move lesson Py into a 224px upper heading stage; add the same stage to PracticeCalendar, idle until a real daily completion. Use 112px on phones.
- [x] Update studio.css: direct static image sizing without transform/filter; responsive stages collapse when Py is hidden.
- [x] Update py-browser routing expectations for calendar presence; test unmount cancellation on the unknown route instead.

## Task 2: Library and final verification
- [x] Replace completion text glyph with the existing SVG check, explicit square geometry and contrasting selected foreground.
- [x] Put the search focus ring on its full container.
- [x] Run focused browser regression, then npm run check, build and full browser suite.
- [x] Inspect actual browser screenshots in dark/light themes and mobile; update docs/mascot.md and deliverable snapshots.
- [x] Self-review diff (no delegation authorized). No unresolved findings.
- [ ] Commit, create and attach draft PR, then check CI. Do not merge/deploy.

## Verification ledger

- Initial regression: five expected failures on the merged build (Retina resolution, lesson placement, marker geometry, search focus, missing calendar companion).
- Final implementation: npm run check passed (17 Python + 16 Node tests and TypeScript); npm run build passed.
- Full browser suite passed: 101 lessons, all 404 examples, both languages, graphics lifecycle/fallback, progress/calendar/backups, responsive layouts and contrast.
- Visual comparison: native 2x crops of the static image and active mesh; desktop and phone lesson/calendar views; library focus and completion marker in both themes.
- Self-review: no subagent delegation was authorized. Checked resource cleanup, one companion per route, hide-column collapse, optional graphics, and preservation of study history.
- Follow-up test correction: delayed import now navigates within the SPA to the unknown route, retaining the original component-unmount cancellation check after calendar gained its own character.
