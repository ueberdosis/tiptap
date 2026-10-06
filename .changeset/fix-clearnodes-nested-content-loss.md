---
"@tiptap/core": patch
---

Fix `clearNodes()` dropping content when clearing a doubly-nested structure (e.g. a list nested inside a list item nested inside another list, as produced by `toggleTaskList`/`toggleBulletList`/`toggleOrderedList` when the selection spans a cross-family list conversion such as taskList → bulletList). `clearNodes()` previously lifted every non-text node found in the selection, including wrapper nodes like `listItem`/`taskItem`, not just textblocks — lifting an outer wrapper before its still-to-be-visited nested children were processed mutated the document mid-iteration and corrupted the positions those later callbacks relied on, ejecting deeply nested content out of the list entirely instead of flattening it alongside its siblings. `clearNodes()` now only lifts textblocks, processed in reverse document order, and no longer independently lifts container nodes.
