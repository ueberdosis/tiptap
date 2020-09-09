<template>
  <div class="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-codeblock'
import Heading from '@tiptap/extension-heading'
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
        History(),
        Paragraph(),
        Text(),
        Bold(),
        Italic(),
        Code(),
        CodeBlock(),
        Heading(),
        Focus({
          className: 'has-focus',
          nested: true,
        }),
      ],
      autoFocus: true,
      content: `
        <p>
          With the focus extension you can add custom classes to focused nodes. Default options:
        </p>
        <pre><code>{\n  className: 'has-focus',\n  nested: true,\n}</code></pre>
        <ul>
          <li>
            When set <code>nested</code> to <code>true</code> also nested elements like this list item will be captured.
          </li>
          <li>
            Otherwise only the wrapping list will get this class.
          </li>
        </ul>
      `,
    })

    window.editor = this.editor
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" src="./style.scss">