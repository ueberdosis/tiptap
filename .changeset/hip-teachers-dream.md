---
'@tiptap/html': patch
---

Wrap happy-dom Window and DOMParser creation to avoid setting global process to null. See https://github.com/ueberdosis/tiptap/issues/6368
