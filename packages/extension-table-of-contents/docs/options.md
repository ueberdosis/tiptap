# Options

Pass options with `TableOfContents.configure()`. Every option is optional.

```js
TableOfContents.configure({
  anchorTypes: ['heading'],
  onUpdate(items, isCreate) {},
})
```

| Option                                        | Default            | What it does                                           |
| --------------------------------------------- | ------------------ | ------------------------------------------------------ |
| [`anchorTypes`](#anchortypes)                 | `['heading']`      | The node types that appear in the outline              |
| [`onUpdate`](#onupdate)                       | does nothing       | Called with the outline after every change             |
| [`getIndex`](#getindex)                       | `getLinearIndexes` | How each item's `itemIndex` is counted                 |
| [`getLevel`](#getlevel)                       | `getHeadlineLevel` | How each item's `level` is worked out                  |
| [`getId`](#getid)                             | a random UUID      | The ID a new heading gets                              |
| [`scrollParent`](#scrollparent)               | `() => window`     | The element whose scroll position decides `isActive`   |
| [`updateOnTransaction`](#updateontransaction) | `true`             | Whether the storage and `onUpdate` follow every change |

## anchorTypes

The node types that appear in the outline. Use it when your headings have another name, or when
other nodes belong in the outline too.

```js
TableOfContents.configure({
  anchorTypes: ['heading', 'customAnchor'],
})
```

The extension adds the `id` and `data-toc-id` attributes to these node types. A node type
without a `level` attribute counts as level 1.

## onUpdate

Called with the outline when the editor starts and after every change to the document. The
second argument is `true` on the first call.

```js
TableOfContents.configure({
  onUpdate(items, isCreate) {
    renderSidebar(items)
  },
})
```

[Storage](storage.md#items) describes the items. The callback also runs when the reader scrolls,
so `isActive` and `isScrolledOver` stay current.

## getIndex

Decides each item's `itemIndex`, for example to number the outline. Two functions come with the
package: `getLinearIndexes` counts 1, 2, 3 through the whole document, `getHierarchicalIndexes`
starts again at 1 under every parent heading.

```js
import { getHierarchicalIndexes } from '@tiptap/extension-table-of-contents'

TableOfContents.configure({
  getIndex: getHierarchicalIndexes,
})
```

Write your own function with the same signature: `(anchor, previousItems, level) => number`.
`anchor` is `{ node, pos }`. [Index helpers](index-helpers.md) explains the two built-in ones.

## getLevel

Decides each item's `level`. The default, `getHeadlineLevel`, follows the heading levels but never
indents more than one step below the previous item.

```js
TableOfContents.configure({
  getLevel: (anchor, previousItems) => anchor.node.attrs.level,
})
```

## getId

Returns the ID for a heading that has none, or whose ID is already used. It receives the heading's
text. The default returns a random UUID.

```js
TableOfContents.configure({
  getId: textContent => `${slugify(textContent)}-${Math.random().toString(36).slice(2, 6)}`,
})
```

Return unique IDs. The extension calls `getId` again for a duplicate, but it does not change what
`getId` returns, so a function that only uses the text gives two headings with the same text the
same ID. [Heading IDs](heading-ids.md) explains when IDs are written.

## scrollParent

A function that returns the element that scrolls. The extension uses its scroll position to set
`isActive` and `isScrolledOver`.

```js
TableOfContents.configure({
  scrollParent: () => document.querySelector('.editor-scroll-container'),
})
```

Passing the element itself still works, but logs a deprecation warning. Use a function.

## updateOnTransaction

Whether the extension keeps `editor.storage.tableOfContents` in sync and calls `onUpdate` after
every change. On by default.

Set it to `false` when you read the outline with [`resolveTableOfContents`](reading.md) instead.
The extension then skips the work it does on every change: it reads the position of every
heading from the DOM and dispatches a transaction with the new outline.

```js
TableOfContents.configure({
  updateOnTransaction: false,
})
```

With `false`:

- Headings still get IDs. [Heading IDs](heading-ids.md)
- The storage stays empty until you call [`updateTableOfContents()`](commands.md).
- `onUpdate` is called only by `updateTableOfContents()`.
- The extension does not listen to `scrollParent`, so `isActive` and `isScrolledOver` do not change
  while the reader scrolls.
