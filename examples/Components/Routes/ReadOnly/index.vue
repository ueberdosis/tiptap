<template>
  <div class="editor">
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
          new Bold(),
          new Code(),
          new Italic(),
          new Link(),
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
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
