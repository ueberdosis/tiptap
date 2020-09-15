<template>
  <div>
    <div v-if="editor">
      <button @click="editor.focus().undo()">
        undo
      </button>
      <button @click="editor.focus().redo()">
        redo
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'

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
      content:  `
        <h2>
          History
        </h2>
        <p>
          Try to change some content here. With the <code>History</code> extension you are able to undo and redo your changes. You can also use keyboard shortcuts for this (<code>Control/Command + Z</code> and <code>Control/Command + Shift + Z</code>).
        </p>
      `,
      extensions: defaultExtensions(),
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>