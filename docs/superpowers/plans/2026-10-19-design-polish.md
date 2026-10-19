# Discovery and application chrome refinement

Approved in chat: replace language/theme selects with integrated segmented choices; show a working algorithm immediately; remove generic three-step marketing cards; reduce rounding and catalog spacing. Keep English first, optional Russian and all existing learning/history behavior.

Implementation: execute inline on the existing PR branch. Add a reusable native-radio SegmentedControl with accessible labels and focus states. Use the existing compiled insertion-index trace and ArrayRow/Code views in an explicitly started demo; it never writes completion data. Simplify home copy and presentation, without changing lesson algorithms or calendar rules.

- [x] Run failing browser coverage for segmented controls, keyboard theme selection, demo stepping/result/state across language changes and compact first-screen layout.
- [x] Implement controls and trace-backed demo, refine home/header/catalog CSS and update selectors in existing tests.
- [x] Run unit/types/build and full browser suite; inspect EN/RU desktop/mobile and both themes. Capture updated documentation assets.
- [x] Self-review, commit, update PR #2, verify CI. Do not merge or deploy.

Verification: initial segmented-control test failed against the old UI, then passed. First-screen playback check exposed the 320 px layout and passed after moving controls above the visualization. Full check/types/build and English/Russian browser suite passed; EN/RU mobile and light/dark desktop screenshots inspected. Self-review found no remaining blocking defect.
