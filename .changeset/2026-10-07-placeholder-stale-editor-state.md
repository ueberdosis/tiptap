---
'@tiptap/extensions': patch
---

The placeholder no longer reads a stale document when `includeChildren` is enabled. The `is-editor-empty` class and placeholder text that depends on the document now update after the last character is deleted, and the `placeholder` callback receives the `doc` being decorated.
