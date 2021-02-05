# Table
[![Version](https://img.shields.io/npm/v/@tiptap/extension-table.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-table)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-table.svg)](https://npmcharts.com/compare/@tiptap/extension-table?minimal=true)

TODO

## Installation
::: warning Use with TableRow, TableHeader and TableCell
This extension requires the [`TableRow`](/api/nodes/table-row), [`TableHeader`](/api/nodes/table-header) and [`TableCell`](/api/nodes/table-cell) nodes.
:::

```bash
# with npm
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell

# with Yarn
yarn add @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
```

## Settings
| Option                  | Type      | Default     | Description                                                           |
| ----------------------- | --------- | ----------- | --------------------------------------------------------------------- |
| HTMLAttributes          | `Object`  | `{}`        | Custom HTML attributes that should be added to the rendered HTML tag. |
| resizable               | `Boolean` | `false`     |                                                                       |
| handleWidth             | `Number`  | `5`         |                                                                       |
| cellMinWidth            | `Number`  | `25`        |                                                                       |
| View                    | `View`    | `TableView` |                                                                       |
| lastColumnResizable     | `Boolean` | `true`      |                                                                       |
| allowTableNodeSelection | `Boolean` | `false`     |                                                                       |

## Commands
| Command            | Parameters                                     | Description |
| ------------------ | ---------------------------------------------- | ----------- |
| insertTable        | `{ rows = 3, cols = 3, withHeaderRow = true }` |             |
| addColumnBefore    | –                                              |             |
| addColumnAfter     | –                                              |             |
| deleteColumn       | –                                              |             |
| addRowBefore       | –                                              |             |
| addRowAfter        | –                                              |             |
| deleteRow          | –                                              |             |
| deleteTable        | –                                              |             |
| mergeCells         | –                                              |             |
| splitCell          | –                                              |             |
| toggleHeaderColumn | –                                              |             |
| toggleHeaderRow    | –                                              |             |
| toggleHeaderCell   | –                                              |             |
| mergeOrSplit       | –                                              |             |
| setCellAttribute   | `name`, `value`                                |             |
| goToNextCell       | –                                              |             |
| goToPreviousCell   | –                                              |             |
| fixTables          | –                                              |             |


## Source code
[packages/extension-table/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-table/)

## Usage
<demo name="Nodes/Table" />
