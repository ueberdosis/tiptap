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
    <button @click="editor.chain().focus().highlight({ color: '#ffa8a8' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#ffa8a8' }) }">
      red
    </button>
    <button @click="editor.chain().focus().highlight({ color: '#ffc078' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#ffc078' }) }">
      orange
    </button>
    <button @click="editor.chain().focus().highlight({ color: '#8ce99a' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#8ce99a' }) }">
      green
    </button>
    <button @click="editor.chain().focus().highlight({ color: '#74c0fc' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#74c0fc' }) }">
      blue
    </button>
    <button @click="editor.chain().focus().highlight({ color: '#b197fc' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#b197fc' }) }">
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
          <p><mark style="background-color: #ffa8a8;">And this is highlighted too, but in a different color.</mark></p>
        `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
mark {
  background-color: #ffe066;
}
</style>
