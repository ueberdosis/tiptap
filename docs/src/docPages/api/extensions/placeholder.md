# Placeholder
Enables you to show placeholders on empty paragraphs.

## Table
This enables support for tables in your editor.
Tables can be nested and allow all blocks to be used inside.
Each `<TableCell>` includes a single `<Paragraph>`.

## Options
| Option | Type | Default | Description |
| ------ | ---- | ---- | ----- |
| resizable | Boolean | false | Enables the resizing of columns |

## Keybindings
* `Tab` → Next Cell
* `Shift` + `Tab` + ` → Previous Cell

## Commands
| Command | Options | Description |
| ------ | ---- | ---------------- |
| createTable | ```{ rowsCount, colsCount, withHeaderRow }``` | Returns a table node of a given size. `withHeaderRow` defines whether the first row of the table will be a header row. |
| deleteTable | — | Deletes the complete table which is active |
| addColumnBefore | — | Add a column before the selection. |
| addColumnAfter | — | Add a column after the selection. |
| deleteColumn | — | Removes the selected columns. |
| addRowBefore | — | Add a table row before the selection. |
| addRowAfter | — | Add a table row after the selection. |
| toggleCellMerge | — | See mergeCells and splitCells |
| mergeCells | — | Merge the selected cells into a single cell. Only available when the selected cells' outline forms a rectangle. |
| splitCell | — | Split a selected cell, whose rowspan or colspan is greater than one into smaller cells. |
| toggleHeaderColumn | — | Toggles whether the selected column contains header cells. |
| toggleHeaderRow | — | Toggles whether the selected row contains header cells. |
| toggleHeaderCell | — | Toggles whether the selected column contains header cells. |
| setCellAttr | — | Returns a command that sets the given attribute to the given value, and is only available when the currently selected cell doesn't already have that attribute set to that value. |
| fixTables | — | Inspect all tables in the given state's document and return a transaction that fixes them, if necessary. |

## Usage
::: warning
You have to include all table extensions (`TableHeader`, `TableCell` & `TableRow`)
:::

```markup
  <template>
    <div>
      <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
        <button :class="{ 'is-active': isActive.bold() }" @click="commands.createTable({rowsCount: 3, colsCount: 3, withHeaderRow: false })">
          Create Table
        </button>
      </editor-menu-bar>

      <editor-content :editor="editor" />
    </div>
  </template>

  <script>
  import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
  import { Table, TableCell, TableHeader, TableRow } from 'tiptap-extensions'


  export default {
    components: {
        EditorMenuBar,
        EditorContent,
    },
    data() {
      return {
        editor: new Editor({
          extensions: [
            new Table(),
            new TableCell(),
            new TableHeader(),
            new TableRow(),
          ],
          content: ''
        }),
      }
    },
    beforeDestroy() {
      this.editor.destroy()
    }
  }
  </script>
```