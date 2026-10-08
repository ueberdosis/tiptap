---
'@tiptap/core': patch
---

The injected base styles now reach an editor mounted inside a shadow root. Before, they were always added to `document.head`, so a long word did not wrap in Firefox and the gap cursor styles were missing.
