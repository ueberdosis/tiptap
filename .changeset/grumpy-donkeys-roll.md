---
"@tiptap/core": patch
---

Added support for the `undoable` option in InputRules (matching ProseMirror’s implementation).  

- When `false`, the change will not be tracked as undoable.  
- Default remains `true` for backward compatibility.  

This brings Tiptap’s InputRules behavior in line with ProseMirror and gives developers finer control over undo functionality.
