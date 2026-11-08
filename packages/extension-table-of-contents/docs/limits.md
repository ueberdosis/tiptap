# Limits

## The storage is empty

- The editor is not mounted yet. The extension reads the headings from the DOM, so the storage
  fills after the editor is mounted. Use `onUpdate` instead of reading the storage right after
  `new Editor()`.
- [`updateOnTransaction`](options.md#updateontransaction) is `false`. Call
  [`updateTableOfContents()`](commands.md), or use [`resolveTableOfContents`](reading.md).

## An item is missing

- The heading is empty. Empty headings are not in the outline.
- The node type is not in [`anchorTypes`](options.md#anchortypes).

## `isActive` never changes

- [`scrollParent`](options.md#scrollparent) returns the wrong element. It must be the element that
  scrolls, not the editor inside it.
- `updateOnTransaction` is `false`. The extension then does not listen for scrolling.

## Headings have no ID

- The document was created on the server. The editor writes IDs only in the browser. Run
  [`generateTocIds`](heading-ids.md#ids-on-the-server) before you render or save the document.
- The heading is empty.

## Two headings have the same ID

[`getId`](options.md#getid) returns the same value for headings with the same text. Add something
unique to the ID.

## The outline on the server has no positions on the page

`resolveTableOfContents` reads the document, not the page. It has no `isActive`,
`isScrolledOver` or DOM element. Work those out in the browser.

## Every document change dispatches a transaction

While `updateOnTransaction` is on, the extension dispatches a transaction with the new outline
after every change. The transaction changes nothing in the document, but your `transaction`
listeners run for it. Check for the [`toc` meta](storage.md#noticing-an-update) to skip it, or set
`updateOnTransaction` to `false` if you do not use the storage.
