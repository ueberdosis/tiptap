<template>
  <div>
    <div v-if="editor">
      <button @click="editor.chain().focus().undo().run()">
        undo
      </button>
      <button @click="editor.chain().focus().redo().run()">
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
      content: `
        <p>
          With the <code>History</code> extension the Editor will keep track of your changes. And if you think you made a mistake, you can redo your changes. Try it out, change the content and hit the undo button!
        </p>
        <p>
          And yes, you can also use a keyboard shortcut to undo changes (<code>Control/Cmd</code> <code>Z</code>) or redo changes (<code>Control/Cmd</code> <code>Shift</code> <code>Z</code>).
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
