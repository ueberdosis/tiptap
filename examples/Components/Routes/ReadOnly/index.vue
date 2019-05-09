<template>
  <div class="editor">
    <div class="checkbox">
      <input type="checkbox" id="editable" v-model="editable" />
      <label for="editable">editable</label>
    </div>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import {
  HardBreak,
  Heading,
  Bold,
  Code,
  Italic,
  Link,
} from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        editable: false,
        extensions: [
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
        ],
        content: `
          <h2>
            Read-Only
          </h2>
          <p>
            This text is <strong>read-only</strong>. You are not able to edit something. <a href="https://scrumpy.io/">Links to fancy websites</a> are still working.
          </p>
        `,
      }),
      editable: false,
    }
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

<style lang="scss">
.checkbox {
  margin-bottom: 1rem;
}
</style>
