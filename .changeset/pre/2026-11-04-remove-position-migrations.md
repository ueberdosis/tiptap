---
'@tiptap/y-tiptap': minor
---

Remove persistent position migrations to stop structural edits and undo or redo from adding migration history to collaborative documents. Saved relative positions no longer follow content that structural edits replace or move.

Existing migration entries are deleted when an editor opens and when later Yjs updates arrive. Yjs can reclaim their stored data when garbage collection is enabled. Document content and other shared data are unchanged. Upgrade all collaborating clients to stop older clients from writing new entries.

Documents that the server refuses to load need cleanup on the server before a client can repair them. With Yjs garbage collection disabled, deleting entries does not reclaim their stored data.
