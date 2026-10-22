# Flexible Python parameter names — 2026-10-22

`cutting_wood(heights, k)` previously failed before entering the function because example inputs use the names `a` and `k`.

The runner now validates the signature before invoking user code. Matching keyword arguments retain their original semantics, including reordered named parameters. If keyword binding fails, it validates a positional call in template input order. The submitted source is unchanged; the result records the actual mapping for display beside the replay. A `TypeError` raised by the function body is never retried. Incompatible arity still produces an error before execution.

All 404 example input orders are checked against their reference function signatures. Renamed keyword-only parameters cannot use positional fallback; keep their template names. Optional parameters and `*args` are covered by tests.

Verified:

- `npm run check`: 31 Python tests, 16 Node tests and TypeScript passed.
- `npm run build`: production build passed.
- `test:runner` against production: 404 references and four typed `cutting_wood(heights, k)` examples passed in real Pyodide.
- `test:solutions`: renamed parameters, mapping display, unchanged source, EN/RU switching, mobile layouts and the existing editor/execution scenarios passed.
- `test:browser`: current UI, Py, all English/Russian lessons, calendar and mobile checks passed.
- Independent read-only review found no confirmed defects.

Previews: [desktop EN](../../media/parameter-binding-desktop.jpg), [mobile RU](../../media/parameter-binding-mobile.jpg).
