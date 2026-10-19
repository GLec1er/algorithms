# Py, the robot python

Py is the project's original robot-python character: ivory armor, graphite joints and restrained amber details. The initial artwork was generated for Algorithms Lab with OpenAI's image-generation tool and selected through a design review. The source render lives in `public/mascot/py.png`; no artwork or mascot from the visual reference sites is distributed.

The character is optional. Open **Appearance → Show Py / Animate Py** to hide it, restore it, or disable its motion. The small close button hides it. Preferences live in `patterns-py` in local storage; blocked storage leaves the controls usable for the current tab. They do not affect lesson completion, XP or study history. English and Russian labels follow the app's language.

## Rendering

The static image remains usable without graphics acceleration. For motion, `PyMascot` imports `renderer.ts` only after the image is loaded, visible and allowed to move. A small WebGL mesh deforms the image with separate head, neck, coil and tail weights. This is **2.5D**, not an articulated 3D model: it cannot reveal a different side or move each armor plate independently.

The home character idles until the demo is used. Playback and manual frame changes cause small damped gestures; pause settles, and the example result gets one short response. The lesson dock starts paused. Neither the demo nor the character awards progress.

Drawing is throttled to about 30 fps while active, with device pixel ratio capped at 1.5. Offscreen or hidden-tab characters stop scheduling frames. A settled pose stops drawing. The OS reduced-motion preference takes precedence over the saved motion preference. WebGL failure or context loss leaves the static character available. On unmount, listeners, resize observers, scheduled frames, buffers, textures, programs and the context are released.

No rendering library, external model, animation service or backend is used. The optional renderer is a separate small chunk; the PNG is lazy-loaded and does not block trace controls.

## Validation

`tests/py-browser.mjs` exercises a real WebGL context and observes drawing at the graphics boundary. It covers settling, manual steps, disabled motion, hide/restore, stored preferences, route changes, reduced motion, unavailable WebGL, context loss and denied storage. The existing browser suite also checks both languages, themes, mobile layouts, the catalog, calendar and every example in every lesson.
