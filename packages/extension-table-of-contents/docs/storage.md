# Storage

The extension keeps the outline in `editor.storage.tableOfContents`. `onUpdate` receives the same
items.

```js
const items = editor.storage.tableOfContents.content
```

| Field            | Value                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| `content`        | The outline as [items](#items)                                               |
| `anchors`        | The DOM element of every item, in the same order                             |
| `scrollPosition` | The last scroll position read from [`scrollParent`](options.md#scrollparent) |
| `scrollHandler`  | The listener the extension adds to `scrollParent`. Do not replace it         |

The storage is empty while [`updateOnTransaction`](options.md#updateontransaction) is `false`,
until you call [`updateTableOfContents()`](commands.md).

## Items

| Field            | Type          | Value                                                            |
| ---------------- | ------------- | ---------------------------------------------------------------- |
| `id`             | `string`      | The heading's `data-toc-id`                                      |
| `textContent`    | `string`      | The heading's text                                               |
| `level`          | `number`      | The level in the outline, from [`getLevel`](options.md#getlevel) |
| `originalLevel`  | `number`      | The level stored on the heading                                  |
| `itemIndex`      | `number`      | The number from [`getIndex`](options.md#getindex)                |
| `isActive`       | `boolean`     | Whether this is the last heading the reader has scrolled past    |
| `isScrolledOver` | `boolean`     | Whether the reader has scrolled past this heading                |
| `pos`            | `number`      | The heading's position in the document                           |
| `node`           | `PMNode`      | The heading node                                                 |
| `dom`            | `HTMLElement` | The heading's DOM element                                        |
| `editor`         | `Editor`      | The editor                                                       |

Empty headings are not in the list.

Items need the editor and its DOM. To get an outline without them, use
[`resolveTableOfContents`](reading.md).

## Noticing an update

The extension dispatches a transaction with the meta key `toc` whenever it writes a new outline
to the storage. The meta value is the new list of items.

```js
editor.on('transaction', ({ transaction }) => {
  const items = transaction.getMeta('toc')

  if (items) {
    console.log('New outline', items)
  }
})
```
