# Commands

## updateTableOfContents

Reads the outline again, writes it to `editor.storage.tableOfContents` and calls `onUpdate`.

```js
editor.commands.updateTableOfContents()
```

You rarely need it while [`updateOnTransaction`](options.md#updateontransaction) is on, because
the extension already updates after every change. Call it when:

- `updateOnTransaction` is `false` and you want the storage filled once, for example when a panel
  opens.
- Something outside the document changed what the outline shows, for example the layout moved
  the headings.

It always returns `true`. It reads the DOM, so the editor must be mounted.
