# @tiptap/y-tiptap

## 3.0.11

### Patch Changes

- d45d341: Omit empty `attrs` objects when serializing marks to ProseMirror JSON.
- 9869a4b: Preserve cursor positions and selections when undoing and redoing list changes or deletions. Requires Yjs 13.6.13 or later.

## 3.0.10

### Patch Changes

- 3fd922c: Keep relative text and node positions attached through structural edits, node moves, and undo or redo across collaborating clients.
- 3fd922c: Improve TypeScript definitions for document synchronization, shared cursors, undo, redo, and document conversions.
- 3fd922c: Improve collaboration performance and keep comments, highlights, caret positions, and remote caret details intact during remote edits.
- 3fd922c: Preserve shared content when a client cannot display its nodes or marks, and pause that client's editing until compatible content is available.

  Headless document creation rejects empty content when the schema requires child nodes.
