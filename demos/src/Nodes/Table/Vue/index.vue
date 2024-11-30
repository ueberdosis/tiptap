<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
          Insert table
        </button>
        <button @click="editor.chain().focus().addColumnBefore().run()">
          Add column before
        </button>
        <button @click="editor.chain().focus().addColumnAfter().run()">
          Add column after
        </button>
        <button @click="editor.chain().focus().deleteColumn().run()">
          Delete column
        </button>
        <button @click="editor.chain().focus().addRowBefore().run()">
          Add row before
        </button>
        <button @click="editor.chain().focus().addRowAfter().run()">
          Add row after
        </button>
        <button @click="editor.chain().focus().deleteRow().run()">
          Delete row
        </button>
        <button @click="editor.chain().focus().deleteTable().run()">
          Delete table
        </button>
        <button @click="editor.chain().focus().mergeCells().run()">
          Merge cells
        </button>
        <button @click="editor.chain().focus().splitCell().run()">
          Split cell
        </button>
        <button @click="editor.chain().focus().toggleHeaderColumn().run()">
          Toggle header column
        </button>
        <button @click="editor.chain().focus().toggleHeaderRow().run()">
          Toggle header row
        </button>
        <button @click="editor.chain().focus().toggleHeaderCell().run()">
          Toggle header cell
        </button>
        <button @click="editor.chain().focus().mergeOrSplit().run()">
          Merge or split
        </button>
        <button @click="editor.chain().focus().setCellAttribute('colspan', 2).run()">
          Set cell attribute
        </button>
        <button @click="editor.chain().focus().fixTables().run()">
          Fix tables
        </button>
        <button @click="editor.chain().focus().goToNextCell().run()">
          Go to next cell
        </button>
        <button @click="editor.chain().focus().goToPreviousCell().run()">
          Go to previous cell
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Gapcursor from '@tiptap/extension-gapcursor'
import Paragraph from '@tiptap/extension-paragraph'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

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
        TableCell,
      ],
      content: `
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th colspan="3">Description</th>
            </tr>
            <tr>
              <td>Cyndi Lauper</td>
              <td>Singer</td>
              <td>Songwriter</td>
              <td>Actress</td>
            </tr>
          </tbody>
        </table>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* Table-specific styling */
  table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td,
    th {
      border: 1px solid var(--gray-3);
      box-sizing: border-box;
      min-width: 1em;
      padding: 6px 8px;
      position: relative;
      vertical-align: top;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: var(--gray-1);
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: var(--gray-2);
      content: "";
      left: 0; right: 0; top: 0; bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: var(--purple);
      bottom: -2px;
      pointer-events: none;
      position: absolute;
      right: -2px;
      top: 0;
      width: 4px;
    }
  }

  .tableWrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }
}
</style>
