# @tiptap/y-tiptap

## 3.0.10-next.0

### Patch Changes

- dd62145: Keep relative text and node positions attached through structural edits, node moves, and undo or redo across collaborating clients.
- dd62145: Improve TypeScript definitions for document synchronization, shared cursors, undo, redo, and document conversions.
- dd62145: Improve collaboration performance and keep comments, highlights, caret positions, and remote caret details intact during remote edits.
- dd62145: Preserve shared content when a client cannot display its nodes or marks, and pause that client's editing until compatible content is available.
  
  Headless document creation rejects empty content when the schema requires child nodes.
