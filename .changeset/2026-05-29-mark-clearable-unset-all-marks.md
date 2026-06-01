---
'@tiptap/core': patch
---

Add `clearable` mark option (default `true`). `unsetAllMarks` now skips marks with `clearable: false`, so semantic marks like comments are not removed by "clear formatting".
