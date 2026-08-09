---
'@tiptap/core': minor
'@tiptap/react': minor
'@tiptap/vue-2': minor
'@tiptap/vue-3': minor
---

**New Decorations API**

Finally the decorations API is here! Even though Decorations itself are nothing new in ProseMirror, the new API makes it much easier to use them in Tiptap without leaving your extensions.

Decorations change how the document looks without changing the document itself. Highlighting search results, marking spelling mistakes, showing collaborator cursors, putting a drag handle next to every block.

Until now you had to write a ProseMirror plugin by hand for this, keep the decoration set in plugin state, and map it forward on every transaction. Extensions can now declare decorations directly with a new `addDecorations()` hook.

```js
addDecorations() {
  return {
    create: ({ state }) =>
      // findMatches can be any function that returns an array of { from, to } ranges
      findMatches(state.doc).map(match =>
        Decoration.Inline(match.from, match.to, { class: 'highlight' }),
      ),
  }
}
```

There are three kinds. `Decoration.Inline()` styles a range of text. `Decoration.Node()` puts attributes on a block's DOM element. `Decoration.Widget()` renders your own element at a single position.

Every extension that declares decorations is collected into one plugin, so several extensions can decorate the same document without fighting over it.

**Doing less work on every keystroke**

By default decorations are rebuilt whenever the document changes. That is fine for small documents and wasteful for large ones, so there are two ways to narrow it down.

`shouldUpdate()` skips transactions you do not care about. If your decorations only depend on headings, ignore everything else.

`update: 'changedRanges'` together with `createInRange()` only rescans the blocks that actually changed. On a long document this is the difference between scanning the whole thing on every keystroke and scanning one paragraph.

For decorations driven by data outside the editor, like comments loaded from a server, use `update: 'manual'` and refresh them yourself with `editor.commands.updateDecorations()`.

**React and Vue components as widgets**

`ReactWidgetRenderer` and `VueWidgetRenderer` render a real component into a widget decoration, inside your existing app context. Providers, context and stores work as usual.

Widgets take a `key`. Reuse the same key and the component instance stays mounted while the document changes around it, so local state such as an open menu, a counter or a half-typed input survives editing. Use a stable id from your own data, not a position or a list index, otherwise the component remounts and loses that state.

Widgets also accept the ProseMirror options `side`, `relaxedSide`, `stopEvent` and `ignoreSelection`.

**Documentation**

- [Decorations](https://tiptap.dev/docs/editor/core-concepts/decorations)
- [Decorations with React](https://tiptap.dev/docs/guides/decorations-react)
- [Decorations with Vue](https://tiptap.dev/docs/guides/decorations-vue)
- [API Documentation](https://tiptap.dev/docs/editor/api/decorations)
