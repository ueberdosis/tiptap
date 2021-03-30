<template>
  <div v-if="editor">
    <button @click="editor.chain().focus(). insertText('✨').run()">
      ✨
    </button>
    <button @click="editor.chain().focus(). insertText('😅').run()">
      😅
    </button>
    <button @click="editor.chain().focus(). insertText('🎉').run()">
      🎉
    </button>
    <button @click="editor.chain().focus(). insertText('💖').run()">
      💖
    </button>
    <button @click="editor.chain().focus(). insertText('👀').run()">
      👀
    </button>
    <button @click="editor.chain().focus(). insertText('👍️').run()">
      👍️
    </button>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

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
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  font-size: 3rem;
}

button {
  margin: 0.125rem;
  width: 2rem;
  height: 2rem;
  text-align: center;
  line-height: 2rem;
}
</style>
