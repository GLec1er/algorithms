# Technical Studio and Py Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. The user's standing instructions select execution in this session without subagents.

**Goal:** Bring the approved technical studio and robot-python motion concept into the existing Algorithms Lab.

**Architecture:** Keep the React app, routing, trace data and progress model. Add a shared mascot preference provider, a reusable reserved Py dock, and a lazily imported WebGL image-mesh renderer with a static fallback. Adapt existing chrome and CSS rather than copying the prototype document into the app.

**Tech Stack:** Existing React 19, TypeScript, Vite, native WebGL, existing Playwright and Node/Python tests. No new runtime dependency.

**Spec:** `docs/superpowers/specs/2026-10-19-technical-studio-py.md`

## Global Constraints

- English first, complete optional Russian.
- Preserve all 101 lessons, 404 examples, 19 guides, local progress, calendar, sharing and backups.
- Py is a 2.5D mesh, not an articulated 3D model; do not claim otherwise.
- No motion during reduced motion, hidden tabs, offscreen scenes, or disabled preferences; settled pauses stop drawing.
- A terminal trace never awards study credit. No deployment or PR merge.

## Review Focus

- Dynamic import finishes after route change: no detached renderer, leaked context, or state update.
- Reduced motion or denied storage: usable static character and functioning lesson controls.
- Unavailable/lost WebGL: image remains visible and playback stays usable.
- Appearance popover and header: radio keyboard behavior, Escape focus return, 320px and 200% zoom.
- Hiding, restoring, and toggling motion: preferences persist without changing study history.

### Task 1: Character lifecycle and preferences

**Files:** Create `src/components/py/{PyPreferences.tsx,PyMascot.tsx,renderer.ts}`; add `public/mascot/py.png`; modify `src/main.tsx`; create `tests/py-browser.mjs`.

**Interfaces:** `usePyPreferences()` exposes `visible`, `motion`, `setVisible(boolean)`, `setMotion(boolean)`; `PyMascot` consumes `mode: 'idle'|'playing'|'paused'|'complete'`, `stepToken: string|number`, `variant: 'hero'|'lesson'`. Renderer exports `createPyRenderer(canvas,image,host,onFailure)` returning mode/visibility/enabled/pointer/pulse controls and `dispose()`.

- [x] Write failing browser checks for static reduced-motion behavior, disabled/unavailable WebGL, hiding/restoring, preference persistence, and a visible animated/manual-step scene that settles on pause.
- [x] Confirm the new checks fail against the current build because Py is absent.
- [x] Add preference provider, original asset, lazy renderer and accessible static fallback. Dispose observers, listeners, RAF, buffers, shaders, programs and texture on cleanup.
- [x] Run the targeted browser checks after integrating the dock and Appearance controls in Task 2.

### Task 2: Technical studio layout and controls

**Files:** Modify `src/{Home.tsx,App.tsx,main.tsx}`, `src/components/{AppShell.tsx,HomeDemo.tsx,ThemeToggle.tsx,Icon.tsx}`, `src/styles/{tokens.css,discovery.css}`; add `src/styles/studio.css`; update `tests/ui-controls.mjs`, `tests/design-polish-browser.mjs`, `tests/design-browser.mjs`, `tests/promotion-browser.mjs`.

**Interfaces:** Use Task 1's provider and dock; feed real frame keys and player status. Appearance retains native theme radios in a dismissible panel and exposes Show Py / Animate Py checkboxes. Existing theme keys and locale links stay compatible.

- [x] Update the header/browser tests for Appearance opening, radio arrow selection and Escape focus return; pin the new English heading and mobile first useful demo state.
- [x] Build the grid, desktop rail, restrained theme tokens, home typography and integrated controls. Reuse the existing native catalog dialog and pattern list behavior.
- [x] Add the hero and lesson docks; ensure pause, manual step, reset, example changes, result and locale changes preserve trace behavior.
- [x] Run `npm run check`, `npm run build`, targeted Py/design/promotion checks. Verify restored preferences do not write progress.

### Task 3: Verification, assets and review

**Files:** Update `tests/browser.mjs`, relevant capture scripts and `docs/media/*`; add `docs/mascot.md`; update README/README.ru where the screenshots or character need explanation.

- [x] Run the complete browser suite against the production preview; retain all English/Russian curriculum and example checks.
- [x] Inspect home, lesson and calendar in both themes and languages, at 320/390/768/1024/1440px and 200% zoom. Check character boundaries and readable active scene colors.
- [x] Refresh real screenshots/social preview and documentation to show the shipped UI. Record implementation limits and tested lifecycle paths.
- [x] Review the final diff against the spec, fix confirmed issues, commit, push a feature branch and create/attach a draft PR with validation evidence. Do not merge or deploy.
