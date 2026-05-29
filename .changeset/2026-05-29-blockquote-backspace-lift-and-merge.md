---
'@tiptap/extension-blockquote': minor
---

Backspace at the start of a non-first child of a blockquote now lifts that child out, splitting the blockquote around it. A second backspace at the start of a top-level textblock whose previous sibling is a blockquote merges the textblock's inline content into the blockquote's last textblock instead of pulling the paragraph back inside.
