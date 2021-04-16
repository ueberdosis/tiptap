# Introduction
tiptap is a friendly wrapper around [ProseMirror](https://ProseMirror.net). Although tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage.

### Structure
ProseMirror works with a strict [Schema](/api/schema), which defines the allowed structure of a document. A document is a tree of headings, paragraphs and others elements, so called nodes. Marks can be attached to a node, e. g. to emphasize part of it. [Commands](/api/commands) change that document programmatically.

### Content
The document is stored in a state. All changes are applied as transactions to the state. The state has details about the current content, cursor position and selection. You can hook into a few different [events](/api/events), for example to alter transactions before they get applied.

### Extensions
Extensions add [nodes](/api/nodes), [marks](/api/marks) and/or [functionalities](/api/extensions) to the editor. A lot of those extensions bound their commands to common [keyboard shortcuts](/api/keyboard-shortcuts).

## Vocabulary
ProseMirror has its own vocabulary and you’ll stumble upon all those words now and then. Here is a short overview of the most common words we use in the documentation.

| Word        | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| Schema      | Configures the structure your content can have.                          |
| Document    | The actual content in your editor.                                       |
| State       | Everything to describe the current content and selection of your editor. |
| Transaction | A change to the state (updated selection, content, …)                    |
| Extension   | Registeres new functionality.                                            |
| Node        | A type of content, for example a heading or a paragraph.                 |
| Mark        | Can be applied to nodes, for example for inline formatting.              |
| Command     | Execute an action inside the editor, that somehow changes the state.     |
| Decoration  | Styling on top of the document, for example to highlight mistakes.       |

