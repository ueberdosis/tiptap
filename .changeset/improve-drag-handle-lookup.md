---
"@tiptap/extension-drag-handle": patch
---

Improve drag handle node lookup by scanning element bounding rects inside the editor instead of performing per-pixel `elementsFromPoint` loops, and throttle mouse handling to a single update per animation frame to reduce CPU usage and improve stability.

This should make drag handle positioning and node detection significantly faster and more robust.
