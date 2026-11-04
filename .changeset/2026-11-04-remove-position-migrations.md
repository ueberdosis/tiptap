---
'@tiptap/y-tiptap': minor
---

Remove persistent position migrations to stop structural edits and undo or redo from adding migration history to collaborative documents. Saved relative positions no longer follow content that structural edits replace or move.

Existing migration maps are ignored and left unchanged. Upgrading stops new migration entries but does not shrink documents that already contain them. Upgrade all collaborating clients to stop older clients from writing new entries.
