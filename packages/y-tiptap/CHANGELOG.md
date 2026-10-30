# @tiptap/y-tiptap

## 3.0.10-next.0

### Patch Changes

- dd62145: Keep relative text and node positions attached through structural edits, node moves, and undo or redo across collaborating clients.
- dd62145: Improve TypeScript definitions for document synchronization, shared cursors, undo, redo, and document conversions.
- dd62145: Improve collaboration performance and keep comments, highlights, caret positions, and remote caret details intact during remote edits.
- dd62145: Preserve shared content when a client cannot display its nodes or marks, and pause that client's editing until compatible content is available.
  
  Headless document creation rejects empty content when the schema requires child nodes.
- a1a407d: Omit empty `attrs` objects when serializing marks to ProseMirror JSON.
- 94da3af: Preserve cursor positions and selections when undoing and redoing list changes or deletions. Requires Yjs 13.6.13 or later.
- 4800a32: Restore the behavior from 3.0.9 and earlier for shared content that does not fit the editor schema. The editor stays editable again and removes or adjusts the content it cannot display, instead of becoming read-only.
