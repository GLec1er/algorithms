# Interactive Algorithms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an interactive Russian companion covering all 19 chapters and 101 problems, with executable Python and reproducible visual traces.

**Architecture:** Python algorithms run at build time on fixed, independently checked examples. A bounded tracer records real locals, node identities, call stacks and source lines; the static React/TypeScript player fetches each lesson on demand. This refines the design's duplicated TypeScript generators: prepared examples need no browser runtime, and the displayed Python is the algorithm actually executed.

**Tech Stack:** Python standard library, React, TypeScript, Vite, SVG, CSS, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-10-16-interactive-algorithms-design.md` (approved 2026-10-16).

## Global Constraints

- 19 chapters, 101 distinct problems, at least two examples each; no placeholder lessons.
- Russian interface/explanations, English original titles, Python solution code.
- Play/pause, previous/next/reset, speed, seek; source/variables synchronized.
- Search/filter, hash deep links, local progress, responsive and reduced-motion support.
- Deploy at `/algorithms/` on GitHub Pages; no additional hosting service.

## Review Focus

- Duplicate values and detached/cyclic nodes retain identity in snapshots.
- Switching lessons/examples during playback never mixes old and new frames.
- Last frame, reset and reverse stepping remain deterministic.
- Empty/no-solution inputs and ties use explicit expected outputs.
- Storage failures and unknown hash links leave a usable application.

### Task 1: Curriculum, algorithms and trace compiler

**Files:** Create `curriculum/catalog.py`, `curriculum/runtime.py`, `curriculum/ch01.py` … `curriculum/ch19.py`, `scripts/build_lessons.py`, `tests/test_curriculum.py`, `tests/test_tracer.py`.

**Interfaces:** `catalog.LESSONS: list[dict]`, `catalog.CHAPTERS: list[dict]`; every module exports functions named by lesson `id` (underscores); `runtime.trace(function, args) -> {code, frames, result}`. Frames contain `line`, `message`, `state`, `nodes`, `calls`, `done`. Output `src/catalog.json` and `public/lessons/<id>.json`.

- [ ] Write tests asserting chapter counts `[6,5,6,3,3,8,6,4,3,3,12,3,10,5,9,3,4,3,5]`, unique lesson IDs, two literal expected examples, actual Python results, bounded traces, line bounds, stable/cyclic node serialization and final result.
- [ ] Run `python3 -m unittest discover -s tests -v`; verify missing curriculum fails.
- [ ] Add original algorithms chapter by chapter, with explanatory inline comments and input adapters for standard node types. Keep lesson descriptions, complexity, prerequisites and pitfalls in the catalog.
- [ ] Implement `trace` with a strict step cap, isolated deep-copied inputs, actual Python line events, JSON-safe snapshots and terminal result. Exclude shared constructors/helpers from line tracing; expose their source separately.
- [ ] Implement static compilation, rejecting wrong expected results, invalid line numbers or incomplete catalogs.
- [ ] Run the Python suite and `python3 scripts/build_lessons.py`; expected: 101 lessons, at least 202 validated examples and no failures.
- [ ] Commit curriculum and compiler.

### Task 2: Responsive learning interface and visual scenes

**Files:** Create `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/types.ts`, `src/components/Scene.tsx`, `src/components/Code.tsx`, `src/styles.css`, `tests/browser.mjs`.

**Interfaces:** consumes catalog metadata and per-lesson payloads from Task 1; `Scene({frame, lesson, input})` renders actual captured state; `Code({code, line})` renders Python lines. Player state owns lesson ID, example index, frame index, playing and speed.

- [ ] Add a browser scenario verifying deep links, real step navigation, pause, changing examples during playback, search and unknown routes; run against absent server/interface to establish RED.
- [ ] Build a sidebar catalog, chapter introduction, task heading, main visualization, transport bar, Python/variables panel and explanation/complexity sections. Use SVG keyed node groups and distinct array/grid/interval/graph/tree/heap/bit/geometry/backtracking renderers.
- [ ] Add abortable lesson fetch, loading/error recovery, optional local storage, keyboard control, reduced motion and accessible labels.
- [ ] Run `npm run build`; expected: TypeScript and Vite succeed at base `/algorithms/`.
- [ ] Start local preview, run browser scenario, then open every lesson/example to its last frame at desktop and sample each scene family at mobile. Inspect screenshots.
- [ ] Commit application.

### Task 3: Publication, verification and handoff

**Files:** Create `.github/workflows/pages.yml`; update `README.md`, `.gitignore`; create `docs/verification.md`.

**Interfaces:** `npm run check` runs curriculum verification and TypeScript; `npm run build` compiles traces and application into `dist/`; workflow uploads only `dist` and uses Pages deployment permissions.

- [ ] Check fresh official GitHub Actions/Pages documentation, implement PR checks and main/manual deployment, pin dependencies in lockfile.
- [ ] Run complete Python checks, production build and browser checks against the production base path.
- [ ] Review the complete diff with a fresh review tool if available; otherwise independently re-read scene/trace/player boundary code and record the limitation.
- [ ] Commit, push approved publication to the repository using available authorized GitHub access, configure/trigger Pages if needed, and inspect workflow results.
- [ ] Verify public URL, then report exact checks, published link and any remaining access limitation; preserve a source archive in outputs.

## Execution ledger

- 2026-10-16: User approved full design and instructed implementation. Native execution selected following the user's preference to request subagents only explicitly; no second method approval requested.
- Ruling: use the task-specific clean clone on `feat/interactive-patterns`; a second worktree adds no isolation benefit because this clone has no unrelated work.
- Ruling: compile traces from actual Python execution instead of duplicating algorithms in TypeScript. User-facing behavior is preserved; custom inputs remain outside scope. Cost: changes to examples require rebuilding static assets.
- Pre-flight: Task 1 frame and catalog contracts are consumed by Task 2; Task 3 uses the same build/check commands. No conflicting interfaces found.
