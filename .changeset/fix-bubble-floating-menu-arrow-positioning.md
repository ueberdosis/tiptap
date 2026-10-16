---
"@tiptap/extension-bubble-menu": patch
"@tiptap/extension-floating-menu": patch
---

Fix arrow element positioning when placement axis flips. Previously, stale `top`/`left` styles were not reliably cleared when the floating element repositioned to a different axis (e.g. `left` → `top`), causing the arrow to be mispositioned or stretched. All four sides are now explicitly reset via `removeProperty` before applying the new coordinates.
