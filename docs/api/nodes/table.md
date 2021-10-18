---
description: You’re working on something really serious if you need tables inside a text editor.
icon: table-line
tableOfContents: true
---

# Table

## Introduction
[![Version](https://img.shields.io/npm/v/@tiptap/extension-table.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-table)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-table.svg)](https://npmcharts.com/compare/@tiptap/extension-table?minimal=true)

Nothing is as much fun as a good old HTML table. The `Table` extension enables you to add this holy grail of WYSIWYG editing to your editor.

Don’t forget to add a `spacer.gif`. (Just joking. If you don’t know what that is, don’t listen.)

## Installation
```bash
# with npm
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell

# with Yarn
yarn add @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
```

This extension requires the [`TableRow`](/api/nodes/table-row), [`TableHeader`](/api/nodes/table-header) and [`TableCell`](/api/nodes/table-cell) nodes.

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Table.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### resizable
Default: `false`

### handleWidth
Default: `5`

### cellMinWidth
Default: `25`

### View
Default: `TableView`

### lastColumnResizable
Default: `true`

### allowTableNodeSelection
Default: `false`

## Commands

### insertTable()
Creates a new table, with the specified number of rows and columns, and with a header row (if you tell it to).

```js
editor.commands.insertTable()
editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
```

### addColumnBefore()
Adds a column before the current column.

```js
editor.commands.addColumnBefore()
```

### addColumnAfter()
Adds a column after the current column.

```js
editor.commands.addColumnAfter()
```

### deleteColumn()
Deletes the current column.

```js
editor.commands.deleteColumn()
```

### addRowBefore()
Adds a row above the current row.

```js
editor.commands.addRowBefore()
```

### addRowAfter()
Adds a row below the current row.

```js
editor.commands.addRowAfter()
```

### deleteRow()
Deletes the current row.

```js
editor.commands.deleteRow()
```

### deleteTable()
Deletes the whole table.

```js
editor.commands.deleteTable()
```

### mergeCells()
Merge all selected cells to a single cell.

```js
editor.commands.mergeCells()
```

### splitCell()
Splits the current cell.

```js
editor.commands.splitCell()
```

### toggleHeaderColumn()
Makes the current column a header column.

```js
editor.commands.toggleHeaderColumn()
```

### toggleHeaderRow()
Makes the current row a header row.

```js
editor.commands.toggleHeaderRow()
```

### toggleHeaderCell()
Makes the current cell a header cell.

```js
editor.commands.toggleHeaderCell()
```

### mergeOrSplit()
If multiple cells are selected, they are merged. If a single cell is selected, the cell is splitted into two cells.

```js
editor.commands.mergeOrSplit()
```

### setCellAttribute()
Sets the given attribute for the current cell. Can be whatever you define on the [`TableCell`](/api/nodes/table-cell) extension, for example a background color. Just make sure to register [your custom attribute](/guide/custom-extensions#attributes) first.

```js
editor.commands.setCellAttribute('customAttribute', 'value')
editor.commands.setCellAttribute('backgroundColor', '#000')
```

### goToNextCell()
Go the next cell.

```js
editor.commands.goToNextCell()
```

### goToPreviousCell()
Go to the previous cell.

```js
editor.commands.goToPreviousCell()
```

### fixTables()
Inspects all tables in the document and fixes them, if necessary.

```js
editor.commands.fixTables()
```

## Source code
[packages/extension-table/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table/)

## Usage
https://embed.tiptap.dev/preview/Nodes/Table
