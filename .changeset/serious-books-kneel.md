---
'@tiptap/extension-blockquote': patch
---

Fix Backspace freezing after merging a paragraph into a blockquote by avoiding bundled duplicate ProseMirror classes (via an @tiptap/pm peer dependency) and performing the merge atomically with a single replace step.
