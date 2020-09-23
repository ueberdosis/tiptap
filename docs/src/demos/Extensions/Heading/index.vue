<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().heading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
      h1
    </button>
    <button @click="editor.chain().focus().heading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
      h2
    </button>
    <button @click="editor.chain().focus().heading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
      h3
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
import Heading from '@tiptap/extension-heading'

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
        Heading({
          levels: [1, 2, 3],
        }),
      ],
      content: `
        <h1>This is a headline level 1</h1>
        <h2>This is a headline level 2</h2>
        <h3>This is a headline level 3</h3>
        <h4>This headline will be converted to a paragraph, because it's not defined in the levels option.</h4>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>