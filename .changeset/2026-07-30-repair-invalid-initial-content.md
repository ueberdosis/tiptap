---
'@tiptap/core': patch
---

Content that does not match the schema is now repaired before the editor mounts, instead of crashing the view. Nodes in an impossible position are unwrapped, wrapped or moved to a parent that allows them, so their text is kept.
