<template>
  <div v-if="editor">
    <button disabled>
      ⚠️ createTable
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
        Table,
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: `
        <p>Example Text</p>
        <table>
          <tbody>
            <tr>
              <th>Test</th>
              <th>Test</th>
              <th>Test</th>
            </tr>
            <tr>
              <td>Test</td>
              <td>Test</td>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
        <p>Example Text</p>
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
  table, td {
    border: 3px solid red;
  }

  th {
    border: 3px solid blue;
  }
}
</style>
