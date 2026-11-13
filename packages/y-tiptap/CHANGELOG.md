# @tiptap/y-tiptap

## 3.1.0-next.0

### Minor Changes

- 2c9af0e: `yCursorPlugin` now publishes a `lastSelection` awareness field with each collaborative field's latest selection and whether its editor is focused. Unlike `cursor`, it stays after the editor loses focus, so other clients can still read the selection. `lastSelection` is now reserved and can't be used as the cursor field.
- 9c35ec3: Add the `onInvalidContent` sync option. When it is set, shared content that does not fit the editor schema stays in the shared document instead of being deleted. The editor shows what it can, pauses editing and sends no changes until compatible content arrives.
- 0074302: Remove persistent position migrations to stop structural edits and undo or redo from adding migration history to collaborative documents. Saved relative positions no longer follow content that structural edits replace or move.
  
  Existing migration entries are deleted when an editor opens and when later Yjs updates arrive. Yjs can reclaim their stored data when garbage collection is enabled. Document content and other shared data are unchanged. Upgrade all collaborating clients to stop older clients from writing new entries.
  
  Documents that the server refuses to load need cleanup on the server before a client can repair them. With Yjs garbage collection disabled, deleting entries does not reclaim their stored data.

### Patch Changes

- dd62145: Improve TypeScript definitions for document synchronization, shared cursors, undo, redo, and document conversions.
- dd62145: Improve collaboration performance and keep comments, highlights, caret positions, and remote caret details intact during remote edits.
- dd62145: Preserve shared content when a client cannot display its nodes or marks, and pause that client's editing until compatible content is available.
  
  Headless document creation rejects empty content when the schema requires child nodes.
- a1a407d: Omit empty `attrs` objects when serializing marks to ProseMirror JSON.
- 94da3af: Preserve cursor positions and selections when undoing and redoing list changes or deletions. Requires Yjs 13.6.13 or later.
- 4800a32: Restore the behavior from 3.0.9 and earlier for shared content that does not fit the editor schema. The editor stays editable again and removes or adjusts the content it cannot display, instead of becoming read-only.
