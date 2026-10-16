# Algorithms Lab · reference styling

The requested visual reference is [System Design Lab, chapter 8](https://glec1er.github.io/system_design/simulator/ch8/index.html#api). Its live page and public CSS were inspected before implementation.

## Applied design

- Matching core palette: background `#15161a`, cards `#1d1f25`, raised surfaces `#23252c`, text `#eceef3`, borders `#2d3038`, accent `#7d80f7`, success `#3fd18f` and warning `#f4b544`.
- System UI typography, larger labels, flat cards with 14 px corners, restrained borders and purple primary buttons.
- A shared full-width header with the Algorithms Lab identity and chapter context, numbered chapter navigation and a green chapter badge.
- The existing searchable catalogue remains available for all 101 tasks. Code, playback, storage and algorithm contracts are unchanged.
- Removed the previous circuit decoration, gradients and ornamental technical labels. Existing visualizations use the same purple, green and amber accent system.

## Verification

Production build and `npm run check` pass, including all 13 Python tests and 202 prepared examples. Browser and deployment evidence is recorded with the final deliverables.

The browser suite passes for all 101 lessons with both examples, player and keyboard controls, search, storage recovery and invalid routes. It checks 23 scene configurations at desktop, 320 px and 390 px. Additional layout checks covered three lessons at 320, 390, 768, 1024, 1200 and 1440 px, including the global header and player controls. Mobile menu opening, filtered task selection and dismissal via the backdrop were verified with transition- and route-aware waits. Author review checked the presentation diff; no independent review is claimed.
