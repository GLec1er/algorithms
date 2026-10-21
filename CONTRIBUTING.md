# Contributing to Algorithms Lab

Start with a reproducible user problem: an incorrect result, unclear explanation, inaccessible control or broken visualization. Small, focused pull requests are easier to verify.

## Setup

Use Node.js 24+, npm, Python 3.10+ and Google Chrome for local browser checks. Run `npm ci`, then `npm run dev`. No Python packages are required.

## Correcting a lesson

1. Find its stable ID in `curriculum/catalog.py` and its function in `curriculum/chNN.py`.
2. Reproduce incorrect behavior with a small input and an independently calculated expected result. Add a regression/property test before changing algorithm behavior.
3. Keep the Russian statement and explanation in `catalog.py` and the English counterpart in `english.py` consistent. Clarify preconditions, indexing and tie-breaking.
4. Prepared examples live in `catalog.py` and `extra_examples.py`. Every lesson has at least four distinct inputs, including boundary cases. Add each descriptive example label to `example_labels.json`.
5. Keep Python comments in English. Add their Russian teaching equivalents to `comment_translations.json`. Do not rewrite Python source only in the browser: displayed line numbers must match the trace.
6. When changing a pattern, update both `patterns.py` and the English guide in `english.py`. Use a hand-worked example, explicit invariant and meaningful warnings.

Do not commit generated `src/catalog.json` or `public/lessons/*.json`; the compiler regenerates and validates them. Adding an entirely new lesson changes the intentionally fixed curriculum scope and needs a separate design decision.

## Interface and translations

English is the first-visit default. Preserve the optional Russian experience, keyboard access, narrow layouts, reduced-motion support and existing progress keys. Shared URLs use `?lang=en` or `?lang=ru` before `#/problem/<id>`.

Existing interface copy uses Russian keys and reviewed English values in `src/messages.json`; bilingual components can use the locale context directly. Translate visible text and accessible names. Avoid external translation services and translated algorithm identifiers. Never use HTML from translation strings.

## Required checks

```sh
npm run check
npm run build
npm run preview
# In another terminal, while preview is running:
npm run test:browser
```

For CI Chromium, install `npx playwright install --with-deps chromium` and set `CI=true`. Browser checks cover the English and Russian curriculum, examples, study history, storage denial, backup previews, themes, keyboard controls and narrow viewports. Attach relevant screenshots for visible changes and describe which checks actually ran.

Progress is local user data. Import failures must leave it untouched. Do not introduce tracking, remote uploads or cloud synchronization as incidental changes.
