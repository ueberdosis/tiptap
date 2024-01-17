<template>
  <div v-if="editor">
    <button @click="() => editor.chain().toggleBold().focus().run()">Make bold</button>
    <button @click="() => editor.destroy()">Destroy editor</button>
  </div>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

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
        StarterKit,
      ],
      content: `
        <p>Try destroying the editor</p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }
}
</style>
