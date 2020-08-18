<template>
  <div class="editor">
    <div class="checkbox">
      <input type="checkbox" id="editable" v-model="editable" />
      <label for="editable">editable</label>
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
      editable: false,
    }
  },

  mounted() {
    this.editor = new Editor({
      editable: false,
      content: `
        <h2>
          Read-Only
        </h2>
        <p>
          This text is <strong>read-only</strong>. You are not able to edit something. <a href="https://ueber.io/">Links to fancy websites</a> are still working.
        </p>
      `,
      extensions: defaultExtensions(),
    })

    window.editor = this.editor
  },

  watch: {
    editable() {
      this.editor.setOptions({
        editable: this.editable,
      })
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>