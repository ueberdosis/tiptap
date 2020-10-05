<template>
  <div v-if="editor">
    <button
      @click="editor.chain().focus().highlight({
        color: ''
      }).run()"
      :class="{ 'is-active': editor.isActive('highlight', {
        color: ''
      }) }"
    >
      highlight (default)
    </button>
    <button @click="editor.chain().focus().highlight({ color: 'red' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: 'red' }) }">
      red
    </button>
    <button @click="editor.chain().focus().highlight({ color: 'orange' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: 'orange' }) }">
      orange
    </button>
    <button @click="editor.chain().focus().highlight({ color: 'green' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: 'green' }) }">
      green
    </button>
    <button @click="editor.chain().focus().highlight({ color: 'blue' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: 'blue' }) }">
      blue
    </button>
    <button @click="editor.chain().focus().highlight({ color: 'purple' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: 'purple' }) }">
      purple
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
import Highlight from '@tiptap/extension-highlight'

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
        Highlight(),
      ],
      content: `
          <p>This isn’t highlighted.</s></p>
          <p><mark>But that one is.</mark></p>
          <p><mark style="background-color: red;">And this is highlighted too, but in a different color.</mark></p>
        `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
