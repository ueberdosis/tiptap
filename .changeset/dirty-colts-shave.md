---
'@tiptap/extension-table-header': minor
'@tiptap/extension-table-cell': minor
'@tiptap/extension-table-row': minor
'@tiptap/extension-table': minor
---


This adds all of the table packages to the `@tiptap/extension-table` package.

## TableKit

The `TableKit` export allows configuring the entire table with one extension, and is the recommended way of using the table extensions.

```ts
import { TableKit } from '@tiptap/extension-table'

new Editor({
  extensions: [
    TableKit.configure({
      table: {
        HTMLAttributes: {
          class: 'table',
        },
      },
      tableCell: {
        HTMLAttributes: {
          class: 'table-cell',
        },
      },
      tableHeader: {
        HTMLAttributes: {
          class: 'table-header',
        },
      },
      tableRow: {
        HTMLAttributes: {
          class: 'table-row',
        },
      },
    }),
  ],
})
```

## Table repackaging

Since we've moved the code out of the table extensions to the `@tiptap/extension-table` package, you can remove the following packages from your project:

```bash
npm uninstall @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-table-row
```

And replace them with the new `@tiptap/extension-table` package:

```bash
npm install @tiptap/extension-table
```

## Want to use the extensions separately?

For more control, you can also use the extensions separately.

### Table

This extension adds a table to the editor.

Usage:

```ts
import { Table } from '@tiptap/extension-table'
```

### TableCell

This extension adds a table cell to the editor.

Usage:

```ts
import { TableCell } from '@tiptap/extension-table'
```

### TableHeader

This extension adds a table header to the editor.

Usage:

```ts
import { TableHeader } from '@tiptap/extension-table'
```

### TableRow

This extension adds a table row to the editor.

Usage:

```ts
import { TableRow } from '@tiptap/extension-table'
```
