---
'@tiptap/core': minor
'@tiptap/react': minor
'@tiptap/vue-2': minor
'@tiptap/vue-3': minor
---

**Add Decorations API with framework widget renderers**

Extensions can now declare decorations declaratively via a new lifecycle hook `addDecorations()`. Supports three decoration types — node decorations (attrs on the DOM wrapper), inline decorations (styled spans), and widget decorations (framework components rendered at a position). The `DecorationManager` aggregates all extensions' declarations into a single ProseMirror plugin, with per-extension `shouldUpdate()` gates to control recomputation.

New commands: `updateDecorations(extensionName?)` to force recompute.

Decorations can skip unaffected transactions with `shouldUpdate()` or opt into
block-level updates with `update: 'changedRanges'` and `createInRange()`. Use
`update: 'manual'` for external state and refresh it with `updateDecorations()`.
Framework
widget renderers also expose ProseMirror widget options such as `stopEvent`,
`ignoreSelection`, `side`, and `relaxedSide`.

Framework bindings:

- `@tiptap/react`: `ReactWidgetRenderer` wraps a React component as a ProseMirror widget, preserving state across key-based reassignment
- `@tiptap/vue-2` / `@tiptap/vue-3`: `VueWidgetRenderer` does the same for Vue components, with safeguards against deep reactivity crashes

Use the `decoration` factory (`decoration.node()`, `decoration.inline()`, `decoration.widget()`) to build descriptors inside `addDecorations().create()`.
