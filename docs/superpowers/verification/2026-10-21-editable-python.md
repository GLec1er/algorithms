# Editable Python — verification, 2026-10-21

Implemented the approved `2026-10-21-editable-python-design.md` in branch `feat/editable-python`.

## Verified

- `npm run check`: 23 Python tests, 10 progress tests and TypeScript passed.
- `npm run build`: 101 lessons, 404 reference examples, static runtime assets and production bundle generated.
- `LAB_URL=http://127.0.0.1:4174/algorithms/ npm run test:browser`: existing reference playback, keyboard, storage, all 101 lessons × four examples, calendar/rewards, 23 scenes and 320/390 px layouts passed.
- `LAB_URL=http://127.0.0.1:4174/algorithms/ npm run test:solutions`: own-code execution, all-example results, actual renamed locals, Tab/Enter, stale replay, copy confirmation, draft reload/isolation, no XP mutation, storage denial, stop/restart, edit during execution, partial errors, unsupported node metadata/cyclic trees, standard-library state isolation and runtime download failure/retry passed.
- `LAB_URL=http://127.0.0.1:4174/algorithms/ RUNNER_PRODUCTION=true npm run test:runner`: actual Pyodide execution of all 404 reference examples, custom code, syntax/runtime errors and loop limits passed. The executor was not mocked.
- Desktop light/dark and 390 px own-solution screenshots reviewed. Local browser verification used installed Google Chrome; CI uses Playwright Chromium. Safari/Firefox were not tested locally.

Independent read-only review findings were reproduced and fixed: caught tracer exceptions cannot mark an incomplete replay successful; each example gets a fresh worker/interpreter; mutated node metadata goes through bounded serialization and compatibility checks before drawing.

## Practical limits

Pyodide 314.0.7 loads from jsDelivr on demand. Initial runtime access needs a network connection; offline availability is not guaranteed. Each example initializes a fresh interpreter to reset imported module state. Initialization allows 60 seconds, computation 10 seconds, with 1800 trace frames and bounded snapshots/output. Stops terminate the worker. An incomplete trace never receives a success result.

Existing examples are the input contract. Custom test editing, package installation, automatic complexity inference and automatic progress marking are outside this change. Drafts are local to this browser, one per lesson. Unsupported user types are shown as bounded text/data rather than inferred algorithm diagrams.

CI now includes own-solution and real-runtime checks before Pages publication. This change has not been pushed or deployed.

## Main integration / PR #9

Merged `origin/main` at `eebf51c`, preserving the Technical Studio design, Py branding/companion, English/Russian curriculum, language controls, home screen, progress backups and sharing. Resolved README, npm scripts, lesson generator, Player and payload type conflicts by composing both implementations. Own-solution controls and trace messages now follow EN/RU; language changes preserve the draft and replay position.

Integration checks: 26 Python tests, 16 Node tests, TypeScript and production build passed; the full current browser suite (including Py and all English lessons) and all 404 real Pyodide cases passed. Own-solution regression checks include EN/RU switching and both languages at 320/390 px.
