<template>
  <div class="editor">
    <div class="menubar" v-if="editor">

      <button
        class="menubar__button"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.chain().focus().bold().run()"
      >
        Bold
      </button>

    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'

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
      extensions: defaultExtensions(),
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
