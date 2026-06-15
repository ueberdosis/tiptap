---
'@tiptap/markdown': patch
---

Fix unrecognized HTML detection during markdown parsing to work without `window.DOMParser` or `HTMLUnknownElement`, so angle-bracket placeholders are preserved as literal text in SSR and Node environments.
