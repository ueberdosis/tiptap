<template>
  <div>
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
        <p>
          Start a new line and type <code>#</code> followed by a space to get a headline. Try <code>#</code>, <code>##</code>, <code>###</code>, <code>####</code>, <code>#####</code>, <code>######</code> for different levels.
        </p>
        <p>
          Those conventions are called <strong>input rules</strong> in tiptap. Some of those shortcuts are enabled by default. Try <code>></code> for blockquotes, <code>*</code>, <code>-</code> or <code>+</code> for bullet lists, <code>\`foobar\`</code> to highlight code.
        </p>
        <p>
          You can add your own input rules through adding the <code>inputRules()</code> method in your nodes and marks.
        </p>
      `,
      extensions: defaultExtensions(),
    })

    window.editor = this.editor
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>