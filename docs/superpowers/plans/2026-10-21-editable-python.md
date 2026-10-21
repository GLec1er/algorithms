# Editable Python Solutions Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task by task. The user approved the design and explicitly requested implementation; continue inline without another approval gate.

**Goal:** Let users edit Python, run the existing examples, and replay their actual execution without changing reference lessons or progress.
**Architecture:** A portable Python tracing module emits existing Frame-shaped snapshots and structured errors. A lazy Pyodide module worker runs one example at a time; its client owns cancellation/deadlines. A separate OwnSolution workspace integrates with the current lesson page and preserves the reference Player.
**Tech Stack:** React/TypeScript/Vite, Python, pinned Pyodide 314.0.7 module worker, existing syntax highlighter, unittest and Playwright.
**Spec:** `docs/superpowers/specs/2026-10-21-editable-python-design.md` (approved in chat).

## Global Constraints

- Existing 101 lessons, 404 examples, reference trace generation, progress storage and XP rules remain unchanged.
- Own-solution drafts are browser-local, keyed separately per lesson; imports of curriculum.structures stay available.
- Reference is immutable. Changed source makes prior results stale. Errors and limits never masquerade as successful completion.
- Universal real-state visualization is the default for arbitrary variable names; supported structural views are optional and explicitly selected.
- Runtime loads only on first run, executes off the UI thread, supports stop, 10-second compute deadline per example and 1800-frame limit. Runtime initialization has a separate deadline.
- No backend, auto XP, third-party package installer, custom test editor or deployment in this change.

## Review Focus

- Stop/restart, route changes and changed source must not publish obsolete worker responses.
- Fresh globals, argument copies and node registries isolate each example and repeated runs.
- Arbitrary local variable names/helper functions and early exceptions retain correct source lines and honest partial traces.
- Large/cyclic values, stdout and snapshot size are bounded; comparison uses full results before display truncation.
- Draft storage denial and runtime download failure leave the editor and reference mode usable.

### Task 1: Portable Python trace runner

**Files:** create `curriculum/user_runtime.py`, `tests/test_user_runtime.py`; update `scripts/build_lessons.py` to copy runner and structures as static runtime assets and publish per-lesson starter signatures.
**Interfaces:** `run_solution(source, function_name, args, expected, frame_limit=1800) -> dict` returns frames, result, passed, error, stdout and truncation notices; no thrown user errors. Frame data remains compatible with `src/types.ts`.

- [x] Add failing tests for changed names/helpers, wrong answer, syntax/runtime errors, missing function, bad signature, frame limit, cycles/large state, stdout limits, per-run isolation and all 404 reference programs.
- [x] Implement tracing of submitted filename only, bounded snapshots/identity, real Python result comparison, error line extraction and separate submitted source namespace.
- [x] Run Python tests, existing tests and static lesson build. Inspect generated starter/runtime assets.

### Task 2: Worker and cancellation client

**Files:** create `src/runtime/types.ts`, `src/runtime/python.worker.ts`, `src/runtime/client.ts`; browser tests `tests/runner-browser.mjs`.
**Interfaces:** `PythonRunner.run(request, onStatus): Promise<RunResult>`; `cancel(): void`; `dispose(): void`. Request carries code, lessonId, args and expected. Worker uses pinned Pyodide URL; messages are request-ID scoped and distinguish initialization from execution.

- [x] Browser test real WASM execution before implementation; expect unavailable client/worker.
- [x] Implement lazy module worker, runtime fetch/initialization, validated response, 60-second initialization and 10-second execution deadlines, termination/recreation on stop, cleanup after resolve/error, fresh per-example namespace.
- [x] Test actual code (renamed variables, standard imports, structures), errors, init failure/retry, stop/restart and all 404 references through Pyodide. Do not mock the executor.

### Task 3: Editor, own-solution workspace and universal replay

**Files:** create `src/components/OwnSolution.tsx`, `PythonEditor.tsx`, `UserScene.tsx`, `src/useSolutionDraft.ts`, `src/styles/solutions.css`; modify `App.tsx`, `Code.tsx`, `styles.css` and types as needed. Browser tests `tests/solutions-browser.mjs`.
**Interfaces:** `OwnSolution({lesson,payload})`; `PythonEditor({value,onChange,line})`; `UserScene({frame})`; draft hook saves one source per lesson without touching progress keys.

- [x] Write failing browser tests for mode switch, empty starter, copy confirmation, editor/Tab, run one/all, actual user trace, stale source, persistence/isolation, denied storage and progress unchanged.
- [x] Add reference/own tabs, starter/copy/reset, accessible highlighted textarea, status/errors/stdout, per-example result selection, controls, real-frame source highlighting and universal variable/array/node inspection. Keep reference-mode behavior intact.
- [x] Stop and invalidate execution on source edits/mode switch/unmount; preserve only source drafts, not oversized trace history. Dirty source cannot appear with old trace highlighting.
- [x] Verify both themes, 320/390 mobile editor, partial error traces, retry and keyboard separation from reference Player.

### Task 4: Integration, review and verification

**Files:** `package.json`, workflow and verification docs as needed; integrate new browser suite with CI on production build. Add npm `pyodide` package only if needed to make reproducible offline test assets; do not ship an unpinned runtime.

- [x] Run full check/build, existing browser suite and new real-runtime suite against production preview.
- [x] Review source limits, universal visualization honesty, cancellation races and final diff with a fresh read-only reviewer; fix confirmed defects with failing tests first.
- [x] Capture desktop/mobile own-solution screenshots, open local preview, record runtime network requirement and browser verification limits. No push/deployment unless separately requested.

## Implementation decisions

- Each completed request terminates its worker. The next example initializes a fresh interpreter so imports and standard-library settings cannot leak between examples. Runtime files can use the browser cache; interpreter startup still occurs for every example.
- Unsupported node metadata and cyclic trees use raw snapshot data rather than a guessed diagram.
- A latched trace failure prevents a user exception handler from turning an incomplete trace into a successful run.
- See `docs/superpowers/verification/2026-10-21-editable-python.md` for verification and limits.
