# Overview
tiptap is a friendly wrapper around [ProseMirror](https://ProseMirror.net). Although tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage.

### Structure
ProseMirror works with a strict [Schema](/api/schema), which defines the allowed structure of a document. A document is a tree of headings, paragraphs and others elements, so called nodes. Marks can be attached to a node, e. g. to emphasize part of it. [Commands](/api/commands) change that document programmatically.

### Content
The document is stored in a state. All changes are applied as transactions to the state. The state has details about the current content, cursor position and selection. You can hook into a few different [events](/api/events), for example to alter transactions before they get applied.

### Extensions
Extensions add [nodes](/api/nodes), [marks](/api/marks) and/or [functionalities](/api/extensions) to the editor. A lot of those extensions bound their commands to common [keyboard shortcuts](/api/keyboard-shortcuts).
