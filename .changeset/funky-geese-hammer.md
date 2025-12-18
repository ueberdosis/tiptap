---
'@tiptap/react': patch
'@tiptap/vue-2': patch
'@tiptap/vue-3': patch
---

Append all children of editors parent node to element

Fixes a regression introduced by #6972, that resulted in elements that got appended to the editors parent node staying detached. E.g. the drag handle plugin is affected by this regression.
