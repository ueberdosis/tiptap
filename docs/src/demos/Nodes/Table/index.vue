<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
      ✅ insertTable
    </button>
    <button @click="editor.chain().focus().addColumnBefore().run()">
      ✅ addColumnBefore
    </button>
    <button @click="editor.chain().focus().addColumnAfter().run()">
      ✅ addColumnAfter
    </button>
    <button @click="editor.chain().focus().deleteColumn().run()">
      ✅ deleteColumn
    </button>
    <button @click="editor.chain().focus().addRowBefore().run()">
      ✅ addRowBefore
    </button>
    <button @click="editor.chain().focus().addRowAfter().run()">
      ✅ addRowAfter
    </button>
    <button @click="editor.chain().focus().deleteRow().run()">
      ✅ deleteRow
    </button>
    <button @click="editor.chain().focus().deleteTable().run()">
      ✅ deleteTable
    </button>
    <button @click="editor.chain().focus().mergeCells().run()">
      ⚠️ mergeCells
    </button>
    <button @click="editor.chain().focus().splitCell().run()">
      ⚠️ splitCell
    </button>
    <button @click="editor.chain().focus().toggleHeaderColumn().run()">
      ✅ toggleHeaderColumn
    </button>
    <button @click="editor.chain().focus().toggleHeaderRow().run()">
      ✅ toggleHeaderRow
    </button>
    <button @click="editor.chain().focus().toggleHeaderCell().run()">
      ✅ toggleHeaderCell
    </button>
    <button @click="editor.chain().focus().mergeOrSplit().run()">
      ⚠️ mergeOrSplit
    </button>
    <button @click="editor.chain().focus().setCellAttributes({name: 'color', value: 'pink'}).run()">
      ⚠️ setCellAttributes
    </button>
    <button @click="editor.chain().focus().fixTables().run()">
      ✅ fixTables
    </button>
    <button @click="editor.chain().focus().goToNextCell().run()">
      ✅ goToNextCell
    </button>
    <button @click="editor.chain().focus().goToPreviousCell().run()">
      ✅ goToPreviousCell
    </button>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Gapcursor from '@tiptap/extension-gapcursor'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Gapcursor,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell.extend({
          addAttributes() {
            return {
              // original attributes
              colspan: {
                default: 1,
              },
              rowspan: {
                default: 1,
              },
              colwidth: {
                default: null,
              },
              // add a color attribute to the table cell
              color: {
                default: null,
                renderHTML: attributes => {
                  return {
                    style: `color: ${attributes.color}`,
                  }
                },
              },
            }
          },
        }),
      ],
      content: `
        <p>
          People
        </p>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th colspan="3">Description</th>
            </tr>
            <tr>
              <td>Cyndi Lauper</td>
              <td>singer</td>
              <td>songwriter</td>
              <td>actress</td>
            </tr>
          </tbody>
        </table>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.ProseMirror {
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0; right: 0; top: 0; bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px; top: 0; bottom: 0;
      width: 4px;
      z-index: 20;
      background-color: #adf;
      pointer-events: none;
    }
  }
}

.tableWrapper {
  padding: 1rem 0;
  overflow-x: auto;
}

.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}
</style>
