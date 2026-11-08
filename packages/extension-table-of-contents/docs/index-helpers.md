# Index helpers

Functions for the [`getIndex`](options.md#getindex) and [`getLevel`](options.md#getlevel) options.
They work on the [storage items](storage.md#items) the extension builds, so they need an editor.

```js
import {
  getHeadlineLevel,
  getHierarchicalIndexes,
  getLinearIndexes,
} from '@tiptap/extension-table-of-contents'
```

## getLinearIndexes

The default for `getIndex`. Counts 1, 2, 3 through the whole outline.

| Headings   | `itemIndex` |
| ---------- | ----------- |
| H1, H2, H2 | 1, 2, 3     |

## getHierarchicalIndexes

Starts again at 1 under every parent. Combine the numbers of an item and its parents for a number
like `2.1`.

| Headings       | `itemIndex` |
| -------------- | ----------- |
| H1, H2, H2, H1 | 1, 1, 2, 2  |

```js
TableOfContents.configure({
  getIndex: getHierarchicalIndexes,
})
```

## getHeadlineLevel

The default for `getLevel`. Follows the heading levels, with two rules:

- A heading deeper than the one before it is indented one step, however many levels it skips.
- A heading shallower than the one before it gets the level of the last item at or above its own
  level.

It starts counting at H1, so a document whose first heading is an H2 starts at level 2. For an
outline that always starts at 1, use [`depth`](reading.md#level-and-depth).

## getLastHeadingOnLevel

Returns the last item with the given `level`, or the last item on the nearest shallower level.
Returns `undefined` for level `0` or when there is none.

```js
const parent = getLastHeadingOnLevel(items, item.level - 1)
```

## Other exports

- `TableOfContentsPlugin` is the plugin that gives new headings an ID. The extension adds it, so
  you do not need it unless you build your own extension.
- `debounce` is a general helper. The extension does not use it.
