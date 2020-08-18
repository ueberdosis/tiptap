# Placeholder
Allows you to show placeholders on empty paragraphs.

## Table
This enables support for tables in your editor.
Tables can be nested and allow all blocks to be used inside.
Each `<TableCell>` includes a single `<Paragraph>`.

#### Options
| option | type | default | description |
| ------ | ---- | ---- | ----- |
| resizable | Boolean | false | Enables the resizing of columns |

#### Keybindings
* `Tab` → Next Cell
* `Shift` + `Tab` + ` → Previous Cell

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| createTable | ```{ rowsCount, colsCount, withHeaderRow }``` | Returns a table node of a given size. `withHeaderRow` defines whether the first row of the table will be a header row. |
| deleteTable | none | Deletes the complete table which is active |
| addColumnBefore | none | Add a column before the selection. |
| addColumnAfter | none | Add a column after the selection. |
| deleteColumn | none | Removes the selected columns. |
| addRowBefore | none | Add a table row before the selection. |
| addRowAfter | none | Add a table row after the selection. |
| toggleCellMerge | none | See mergeCells and splitCells |
| mergeCells | none | Merge the selected cells into a single cell. Only available when the selected cells' outline forms a rectangle. |
| splitCell | none | Split a selected cell, whose rowspan or colspan is greater than one into smaller cells. |
| toggleHeaderColumn | none | Toggles whether the selected column contains header cells. |
| toggleHeaderRow | none | Toggles whether the selected row contains header cells. |
| toggleHeaderCell | none | Toggles whether the selected column contains header cells. |
| setCellAttr | none | Returns a command that sets the given attribute to the given value, and is only available when the currently selected cell doesn't already have that attribute set to that value. |
| fixTables | none | Inspect all tables in the given state's document and return a transaction that fixes them, if necessary. |

#### Example
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