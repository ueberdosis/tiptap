<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
      insertTable
    </button>

    <template v-if="editor.isActive('table')">
      <button @click="editor.chain().focus().addColumnBefore().run()" v-if="editor.can().addColumnBefore()">
        addColumnBefore
      </button>
      <button @click="editor.chain().focus().addColumnAfter().run()" v-if="editor.can().addColumnAfter()">
        addColumnAfter
      </button>
      <button @click="editor.chain().focus().deleteColumn().run()" v-if="editor.can().deleteColumn()">
        deleteColumn
      </button>
      <button @click="editor.chain().focus().addRowBefore().run()" v-if="editor.can().addRowBefore()">
        addRowBefore
      </button>
      <button @click="editor.chain().focus().addRowAfter().run()" v-if="editor.can().addRowAfter()">
        addRowAfter
      </button>
      <button @click="editor.chain().focus().deleteRow().run()" v-if="editor.can().deleteRow()">
        deleteRow
      </button>
      <button @click="editor.chain().focus().deleteTable().run()" v-if="editor.can().deleteTable()">
        deleteTable
      </button>
      <button @click="editor.chain().focus().mergeCells().run()" v-if="editor.can().mergeCells()">
        mergeCells
      </button>
      <button @click="editor.chain().focus().splitCell().run()" v-if="editor.can().splitCell()">
        splitCell
      </button>
      <button @click="editor.chain().focus().toggleHeaderColumn().run()" v-if="editor.can().toggleHeaderColumn()">
        toggleHeaderColumn
      </button>
      <button @click="editor.chain().focus().toggleHeaderRow().run()" v-if="editor.can().toggleHeaderRow()">
        toggleHeaderRow
      </button>
      <button @click="editor.chain().focus().toggleHeaderCell().run()" v-if="editor.can().toggleHeaderCell()">
        toggleHeaderCell
      </button>
      <button @click="editor.chain().focus().mergeOrSplit().run()" v-if="editor.can().mergeOrSplit()">
        mergeOrSplit
      </button>
      <button @click="editor.chain().focus().setCellAttribute('colspan', 2).run()" v-if="editor.can().setCellAttribute('colspan', 2)">
        setCellAttribute
      </button>
      <button @click="editor.chain().focus().fixTables().run()" v-if="editor.can().fixTables()">
        fixTables
      </button>
      <button @click="editor.chain().focus().goToNextCell().run()" v-if="editor.can().goToNextCell()">
        goToNextCell
      </button>
      <button @click="editor.chain().focus().goToPreviousCell().run()" v-if="editor.can().goToPreviousCell()">
        goToPreviousCell
      </button>
    </template>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import { defaultExtensions } from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

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
        ...defaultExtensions(),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: `
        <h1>
          Fun with tables
        </h1>
        <p>
          Greeks were the first people to use a table as a dining place. Not sure why they put their plates on a computer display, but I don’t care. If you want to create your own table, tiptap got you covered. No matter, what you want to do with those tables.
        </p>
        <h2>
          Amazing features
        </h2>
        <ul>
          <li>tables with rows, headers and cells</li>
          <li>Support for <code>colgroup</code> and <code>rowspan</code></li>
          <li>Resizable columns</li>
        </ul>
        </ul>
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
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0D0D0D;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      background: none;
      font-size: 0.8rem;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0D0D0D, 0.1);
    margin: 2rem 0;
  }
}

/* Table-specific styling */
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
      background-color: #f1f3f5;
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
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
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
