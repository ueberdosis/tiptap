<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Code from '@tiptap/extension-code'
import Focus from '@tiptap/extension-focus'

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
        Document(),
        Paragraph(),
        Text(),
        Code(),
        Focus({
          className: 'has-focus',
          nested: true,
        }),
      ],
      autoFocus: true,
      content: `
        <p>
          The focus extension adds custom classes to focused nodes. By default, it’ll add a <code>has-focus</code> class, even to nested nodes:
        </p>
        <pre><code>{ className: 'has-focus', nested: true }</code></pre>
        <ul>
          <li>With <code>nested: true</code> nested elements like this list item will be focused.</li>
          <li>Otherwise the whole list will get the focus class, even if only a single list item is selected.</li>
        </ul>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.has-focus {
  border-radius: 3px;
  box-shadow: 0 0 0 3px #3ea4ffe6;
}
</style>
