---
'@tiptap/core': minor
---

Previously, only a json representation of the node could be inserted into the editor. This change allows for the insertion of Prosemirror `Node`s and `Fragment`s directly into the editor through the `insertContentAt`, `setContent` and `insertContent` commands.
