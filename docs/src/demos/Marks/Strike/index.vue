<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
      strike
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Strike from '@tiptap/extension-strike'

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
        Document,
        Paragraph,
        Text,
        Strike,
      ],
      content: `
          <p>This isn’t striked through.</s></p>
          <p><s>But that’s striked through.</s></p>
          <p><del>And this.</del></p>
          <p><strike>This too.</strike></p>
          <p style="text-decoration: line-through">This as well.</p>
        `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
