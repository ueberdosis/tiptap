---
'@tiptap/markdown': patch
---

Fixed two Markdown serialization bugs: overlapping marks (e.g. bold+italic that start and end at different positions) now serialize with the correct delimiter order, and marks that all close on the same node now close in LIFO order to produce valid nesting.
