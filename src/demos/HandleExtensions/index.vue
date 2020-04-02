<template>
  <div>
    <div v-if="editor">
      <button @click="editor.focus().undo()">
        undo
      </button>
      <button @click="editor.focus().redo()">
        redo
      </button>
      <button @click="editor.focus().bold()" :class="{ 'is-active': editor.isActive('bold') }">
        bold
      </button>
      <button @click="editor.focus().italic()" :class="{ 'is-active': editor.isActive('italic') }">
        italic
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-codeblock'

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
      content: '<p>foo</p><pre>code **bold** _italic_</pre>',
      extensions: [
        new Document(),
        new Paragraph(),
        new Text(),
        new CodeBlock(),
        new History(),
        new Bold(),
        new Italic(),
        new Code(),
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>