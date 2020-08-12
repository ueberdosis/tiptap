<template>
  <div class="editor">
    <div class="menubar" v-if="editor">

      <button
        class="menubar__button"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.focus().bold()"
      >
        Bold
      </button>

    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent, Renderer } from '@tiptap/vue'
import extensions from '@tiptap/starter-kit'

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
      content: '<p>Hi! 👋 I’m a text editor with just one button. Select some text and press the button to see what it does. Yes, it’s marking text <strong>bold</strong>. Amazing, isn’t it?</p>',
      extensions: extensions(),
      renderer: Renderer,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>