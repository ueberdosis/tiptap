---
'@tiptap/y-tiptap': patch
---

Avoid spreading long text into `Array.push` in `getPositionContent`, which could throw `RangeError: Maximum call stack size exceeded` during position migration.
